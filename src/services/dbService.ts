// Database initialization and operations

// Define types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO date string
  title: string;
  accountId: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isDefault: boolean;
  accountId: string;
}

export interface Limit {
  id: string;
  categoryId: string;
  amount: number;
  accountId: string;
}

export interface Template {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
  accountId: string;
}

export interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  type: TransactionType;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string; // ISO date string
  accountId: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  deadline: string; // ISO date string
  accountId: string;
}

export interface Account {
  id: string;
  name: string;
  initials: string;
  profileImage?: string; // base64 or URL
  email?: string;
}

// Default data
export const DEFAULT_ACCOUNT_ID = 'main-account';

export const DEFAULT_ACCOUNT: Account = {
  id: DEFAULT_ACCOUNT_ID,
  name: 'Mein Konto',
  initials: 'MK',
  profileImage: '',
  email: '',
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Income categories
  { id: 'income-general', name: 'General', type: 'income', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'income-salary', name: 'Lohn', type: 'income', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'income-allowance', name: 'Taschengeld', type: 'income', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  
  // Expense categories
  { id: 'expense-general', name: 'General', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-office', name: 'Büro', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-internet', name: 'Internet', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-treasure', name: 'Schatz', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-clothing', name: 'Kleidung', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-hobby', name: 'Hobby', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-mobile', name: 'Handy', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-goingout', name: 'Ausgehen', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-bus', name: 'Bus', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-vacation', name: 'Urlaub', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-food', name: 'Food', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-transport', name: 'Transport', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-leisure', name: 'Leisure', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-housing', name: 'Housing', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-utilities', name: 'Utilities', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-entertainment', name: 'Entertainment', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-travel', name: 'Travel', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
  { id: 'expense-misc', name: 'Miscellaneous', type: 'expense', isDefault: true, accountId: DEFAULT_ACCOUNT_ID },
];

// Helper for checking if IndexedDB is supported
const isIndexedDBSupported = () => {
  return 'indexedDB' in window;
};

// DB initialization
export const initDB = () => {
  return new Promise<void>((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      console.error('IndexedDB is not supported in this browser');
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = indexedDB.open('BudgetWiseDB', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      if (!db.objectStoreNames.contains('accounts')) {
        db.createObjectStore('accounts', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('categories')) {
        db.createObjectStore('categories', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('limits')) {
        db.createObjectStore('limits', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('recurringItems')) {
        db.createObjectStore('recurringItems', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('savingsGoals')) {
        db.createObjectStore('savingsGoals', { keyPath: 'id' });
      }
    };

    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };

    request.onsuccess = async (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('Database opened successfully');

      // Initialize with default data if needed
      try {
        // Check if there's any account already
        const accounts = await getAll<Account>('accounts');
        if (accounts.length === 0) {
          await add('accounts', DEFAULT_ACCOUNT);
          
          // Add default categories
          for (const category of DEFAULT_CATEGORIES) {
            await add('categories', category);
          }
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    };
  });
};

// Generic CRUD functions
export const add = <T extends { id: string }>(storeName: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BudgetWiseDB', 1);
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const addRequest = store.add(item);
      
      addRequest.onsuccess = () => {
        resolve(item);
      };
      
      addRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

export const get = <T>(storeName: string, id: string): Promise<T | undefined> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BudgetWiseDB', 1);
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };
      
      getRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

export const getAll = <T>(storeName: string): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BudgetWiseDB', 1);
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

export const update = <T extends { id: string }>(storeName: string, item: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BudgetWiseDB', 1);
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const putRequest = store.put(item);
      
      putRequest.onsuccess = () => {
        resolve(item);
      };
      
      putRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

export const remove = (storeName: string, id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BudgetWiseDB', 1);
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = (event) => {
        reject((event.target as IDBRequest).error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
};

// Helper function to generate a unique ID
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Reset the database (for App reset feature)
export const resetDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase('BudgetWiseDB');
    
    request.onerror = (event) => {
      reject(new Error('Failed to delete database'));
    };
    
    request.onsuccess = () => {
      console.log('Database deleted successfully');
      
      // Reinitialize the database
      initDB()
        .then(() => resolve())
        .catch((error) => reject(error));
    };
  });
};
