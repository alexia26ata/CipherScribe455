
export interface EncryptionHistoryItem {
  id: string;
  timestamp: number;
  plaintext: string;
  ciphertext: string;
  keyUsed: string; // Just storing the key type and size for security
}

const STORAGE_KEY = 'rsa_encryption_history';

export const saveToHistory = (item: Omit<EncryptionHistoryItem, 'id' | 'timestamp'>): void => {
  try {
    // Get existing history
    const history = getHistory();
    
    // Create new history item
    const newItem: EncryptionHistoryItem = {
      ...item,
      id: generateId(),
      timestamp: Date.now()
    };
    
    // Add to beginning of history
    history.unshift(newItem);
    
    // Save back to storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

export const getHistory = (): EncryptionHistoryItem[] => {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const deleteHistoryItem = (id: string): void => {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
