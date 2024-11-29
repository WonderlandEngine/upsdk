import {SaveGameProvider} from '../savegame.js';

/**
 * Save Game stored in local storage.
 *
 * Stores save game objects as JSON strings in local stores
 * with given storage key.
 */
export class LocalStorageSaveGameProvider implements SaveGameProvider {
    name = 'localStorage';
    available = true;

    constructor(public storageKey: string = 'save-game') {}

    save(o: any): void {
        localStorage.setItem(this.storageKey, JSON.stringify(o));
    }

    load(out?: any) {
        const data = localStorage.getItem(this.storageKey);
        const value = data ? JSON.parse(data) : null;
        if (!value) return null;
        Object.assign(out, value);
        return out;
    }
}
