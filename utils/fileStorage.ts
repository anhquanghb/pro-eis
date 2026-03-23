
import { get, set, del } from 'idb-keyval';

const HANDLES_KEY = 'recent_file_handles';

export interface FileHandleInfo {
    name: string;
    handle: FileSystemFileHandle;
    lastUsed: string;
}

export const saveFileHandle = async (handle: FileSystemFileHandle) => {
    try {
        const existing = await get<FileHandleInfo[]>(HANDLES_KEY) || [];
        const newInfo: FileHandleInfo = {
            name: handle.name,
            handle: handle,
            lastUsed: new Date().toISOString()
        };
        
        // Remove duplicate by name or handle
        const filtered = existing.filter(h => h.name !== handle.name);
        const updated = [newInfo, ...filtered].slice(0, 5); // Keep last 5
        
        await set(HANDLES_KEY, updated);
        return updated;
    } catch (e) {
        console.error("Failed to save file handle", e);
        return [];
    }
};

export const getRecentHandles = async () => {
    try {
        const handles = await get<FileHandleInfo[]>(HANDLES_KEY) || [];
        // Verify handles are still valid (permission might be needed later)
        return handles;
    } catch (e) {
        console.error("Failed to get handles", e);
        return [];
    }
};

export const clearHandles = async () => {
    await del(HANDLES_KEY);
};

export const removeFileHandle = async (name: string) => {
    try {
        const existing = await get<FileHandleInfo[]>(HANDLES_KEY) || [];
        const updated = existing.filter(h => h.name !== name);
        await set(HANDLES_KEY, updated);
        return updated;
    } catch (e) {
        console.error("Failed to remove file handle", e);
        return [];
    }
};
