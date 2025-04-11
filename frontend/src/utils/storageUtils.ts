export interface EncryptionHistoryItem {
  id: string;
  timestamp: number;
  plaintext: string;
  ciphertext: string;
  keyUsed: string; // Just storing the key type and size for security
}

const getUsernameFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username || null;
  } catch (e) {
    console.error('Failed to decode token:', e);
    return null;
  }
};

const getStorageKey = (): string => {
  const user = getUsernameFromToken();
  return user ? `rsa_encryption_history_${user}` : 'rsa_encryption_history_guest';
};

export const saveToHistory = (item: Omit<EncryptionHistoryItem, 'id' | 'timestamp'>): void => {
  try {
    const history = getHistory();

    const newItem: EncryptionHistoryItem = {
      ...item,
      id: generateId(),
      timestamp: Date.now(),
    };

    history.unshift(newItem);

    localStorage.setItem(getStorageKey(), JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save to history:', error);
  }
};

export const getHistory = (): EncryptionHistoryItem[] => {
  try {
    const history = localStorage.getItem(getStorageKey());
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
};

export const clearHistory = (): void => {
  localStorage.removeItem(getStorageKey());
};

export const deleteHistoryItem = (id: string): void => {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Failed to delete history item:', error);
  }
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};
