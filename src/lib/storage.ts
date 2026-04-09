const STORAGE_KEY = 'noun-gender';

interface StorageData {
  voiceGender: 'female' | 'male';
  locale?: string;
}

const defaults: StorageData = {
  voiceGender: 'male',
};

function read(): StorageData {
  if (typeof window === 'undefined') return { ...defaults };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Partial<StorageData>;
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
}

function write(patch: Partial<StorageData>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = read();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...patch }));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

export const storage = { read, write };
