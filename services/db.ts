import { DBSchema, Employee, NewsArticle, RedeemedReward, Sector, Suggestion, SuggestionStatus, ImportanceLevel } from "../types";

const DB_KEY = 'delafruit_db_v1_cat'; // Changed key to force reset with new data language

// --- INITIAL MOCK DATA (Seeds the DB on first load) ---
const INITIAL_DATA: DBSchema = {
  employees: [
    { id: 'rootclient', name: 'Usuari Prova', role: 'Operari', sector: 'PRODUCTION', points: 340, pin: 'root', isAdmin: false },
    { id: 'rootadmin', name: 'Administrador', role: 'Super Admin', sector: 'ADMIN', points: 9999, pin: 'root', isAdmin: true },
    { id: 'EMP001', name: 'Ana García', role: 'Resp. Màrqueting', sector: 'MARKETING', points: 850, pin: '1234' },
    { id: 'EMP002', name: 'Pere López', role: 'Manteniment', sector: 'PRODUCTION', points: 1250, pin: '0000' },
    { id: 'EMP003', name: 'Llúcia Méndez', role: 'RRHH', sector: 'OFFICE', points: 620, pin: '1111' },
    { id: 'EMP004', name: 'Xavi Soria', role: 'Logística', sector: 'PRODUCTION', points: 120, pin: '2222' },
  ],
  news: [
    {
        id: '1',
        title: 'Nova Màquina Embotelladora a la Línia 2',
        summary: 'Instal·lació completada amb èxit. Millora la producció un 20%.',
        content: `<p>L'equip d'enginyeria ha finalitzat la instal·lació de la Krones V2. Aquesta màquina permet processar 5000 ampolles més per hora.</p><p>Es requereix formació per a tots els operaris del torn de matí.</p>`,
        date: new Date().toISOString(),
        readBy: [],
        imageUrl: 'https://images.unsplash.com/photo-1596450523824-343586d639b7?q=80&w=600&auto=format&fit=crop',
        sector: 'PRODUCTION',
        importance: 'HIGH',
        stats: { views: 150, likes: 45, dislikes: 2, avgTime: 120 }
    },
    {
        id: '2',
        title: 'Resultats Financers Q1 2024',
        summary: 'Hem superat les expectatives de vendes.',
        content: `<p>Gràcies a l'esforç de tots, hem incrementat l'EBITDA un 15%.</p>`,
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        readBy: [],
        imageUrl: 'https://images.unsplash.com/photo-1554224155-984063584d45?q=80&w=600&auto=format&fit=crop',
        sector: 'OFFICE',
        importance: 'MEDIUM',
        stats: { views: 89, likes: 20, dislikes: 0, avgTime: 200 }
    },
    {
        id: '3',
        title: 'Protocol de Seguretat: Carretilles',
        summary: 'Recordatori obligatori sobre zones de pas.',
        content: `<p>Es prega extremar precaució al passadís central. L'ús d'armilla és obligatori.</p>`,
        date: new Date(Date.now() - 86400000 * 10).toISOString(),
        readBy: [],
        imageUrl: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?q=80&w=600&auto=format&fit=crop',
        sector: 'PRODUCTION',
        importance: 'HIGH',
        stats: { views: 300, likes: 10, dislikes: 5, avgTime: 45 }
    },
    {
        id: '4',
        title: 'Menú Saludable al Menjador',
        summary: 'Noves opcions veganes i sense gluten.',
        content: `<p>Atenent als suggeriments, hem ampliat el menú amb amanides de quinoa i tofu.</p>`,
        date: new Date().toISOString(),
        readBy: [],
        imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop',
        sector: 'ALL',
        importance: 'NORMAL',
        stats: { views: 210, likes: 90, dislikes: 2, avgTime: 60 }
    }
  ],
  suggestions: [
    { id: '1', text: 'Més opcions vegetarianes al menjador si us plau.', date: new Date().toISOString(), isAnonymous: false, authorName: 'Ana García', status: 'ACCEPTED' },
    { id: '2', text: 'La màquina de cafè de la planta 2 degota.', date: new Date(Date.now() - 10000000).toISOString(), isAnonymous: true, status: 'PENDING' }
  ],
  redemptions: []
};

// --- CORE DB FUNCTIONS ---

const readDB = (): DBSchema => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(data);
};

const writeDB = (data: DBSchema) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

// --- PUBLIC API ---

export const db = {
  getEmployees: () => readDB().employees,
  
  getNews: () => readDB().news,
  
  getSuggestions: () => readDB().suggestions,

  getRedemptions: (userId: string) => readDB().redemptions.filter(r => r.userId === userId || r.giftedTo === db.getEmployees().find(e => e.id === userId)?.name),

  login: (id: string, pin: string): Employee | null => {
    const employees = readDB().employees;
    return employees.find(e => e.id === id && e.pin === pin) || null;
  },

  voteArticle: (userId: string, articleId: string, points: number) => {
    const data = readDB();
    
    // Update User Points
    const userIndex = data.employees.findIndex(e => e.id === userId);
    if (userIndex === -1) return null;
    data.employees[userIndex].points += points;

    // Update Article Read Status & Stats
    const artIndex = data.news.findIndex(n => n.id === articleId);
    if (artIndex !== -1) {
        data.news[artIndex].readBy.push(userId);
        if (data.news[artIndex].stats) {
            data.news[artIndex].stats!.views += 1;
            data.news[artIndex].stats!.likes += 1; // Simplification
        }
    }

    writeDB(data);
    return { user: data.employees[userIndex], news: data.news };
  },

  createArticle: (article: Omit<NewsArticle, 'id' | 'date' | 'readBy' | 'stats'>) => {
      const data = readDB();
      const newArticle: NewsArticle = {
          ...article,
          id: Date.now().toString(),
          date: new Date().toISOString(),
          readBy: [],
          stats: { views: 0, likes: 0, dislikes: 0, avgTime: 0 }
      };
      data.news.unshift(newArticle);
      writeDB(data);
      return data.news;
  },

  redeemReward: (userId: string, rewardName: string, cost: number, targetSector?: Sector, isSharedPack?: boolean) => {
    const data = readDB();
    const userIndex = data.employees.findIndex(e => e.id === userId);
    
    if (userIndex === -1) throw new Error("Usuari no trobat");

    // NEW LOGIC: Shared Pack costs the SAME as single item (Gift is free)
    const totalCost = cost;

    if (data.employees[userIndex].points < totalCost) {
        throw new Error("Saldo insuficient");
    }

    // Deduct points from Payer
    data.employees[userIndex].points -= totalCost;

    // 1. Create Redemption for the User
    const userRedemption: RedeemedReward = {
        id: Date.now().toString(),
        userId,
        rewardName,
        cost: cost, // Record individual cost per item visually
        date: new Date().toISOString(),
        qrToken: `DELA-${userId}-${Date.now()}`
    };
    data.redemptions.unshift(userRedemption);

    let giftedToName: string | undefined = undefined;

    // 2. If Shared Pack, find random user and create gift redemption
    if (isSharedPack && targetSector) {
        const candidates = data.employees.filter(e => e.sector === targetSector && e.id !== userId);
        // Fallback if no one in sector: pick anyone
        
        const winner = candidates.length > 0 
            ? candidates[Math.floor(Math.random() * candidates.length)] 
            : null;

        if (winner) {
            giftedToName = winner.name;
            const giftRedemption: RedeemedReward = {
                id: (Date.now() + 1).toString(),
                userId: userId, // Payer is still the user (for tracking)
                rewardName: `${rewardName} (Regal de ${data.employees[userIndex].name})`,
                cost: 0, // Gift is free for the record
                date: new Date().toISOString(),
                qrToken: `GIFT-${winner.id}-${Date.now()}`,
                giftedTo: winner.name,
                isGift: true
            };
            data.redemptions.unshift(giftRedemption);
        }
    }

    writeDB(data);
    return { user: data.employees[userIndex], redemption: userRedemption, giftedTo: giftedToName };
  },

  addSuggestion: (text: string, isAnonymous: boolean, authorName: string) => {
    const data = readDB();
    
    // Add Suggestion
    const newSuggestion: Suggestion = {
        id: Date.now().toString(),
        text,
        isAnonymous,
        authorName: isAnonymous ? undefined : authorName,
        date: new Date().toISOString(),
        status: 'PENDING'
    };
    data.suggestions.unshift(newSuggestion);

    const userIndex = data.employees.findIndex(e => e.name === authorName); 
    if (userIndex !== -1) {
        data.employees[userIndex].points += 30;
    }

    writeDB(data);
    return { suggestions: data.suggestions, user: userIndex !== -1 ? data.employees[userIndex] : null };
  },

  updateSuggestionStatus: (id: string, status: SuggestionStatus) => {
    const data = readDB();
    const index = data.suggestions.findIndex(s => s.id === id);
    if (index !== -1) {
        data.suggestions[index].status = status;
        writeDB(data);
    }
    return data.suggestions;
  },

  deleteSuggestion: (id: string) => {
    const data = readDB();
    data.suggestions = data.suggestions.filter(s => s.id !== id);
    writeDB(data);
    return data.suggestions;
  }
};