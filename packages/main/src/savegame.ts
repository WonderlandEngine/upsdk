import {AbstractGlobalProvider, Provider} from './provider.js';

const SAVE_GAME_PROVIDER_SYMBOL = Symbol.for(
    '@wonderlandengine/uber-sdk/save-game-provider'
);

/**
 * Save Game Provider
 *
 * Interface for services providing ability to save and load game state.
 * Storage might be in the cloud or local.
 */
export interface SaveGameProvider extends Provider {
    /**
     * Save an object to the save game storage
     * @param o The object to save
     */
    save(o: any): void;
    /**
     * Load an object from the save game storage
     *
     * @param out Optional object to load the save game into, overwriting entries.
     *     This is a useful way to specify defaults.
     * @returns The loaded save game object. If `out` was provided, returns `out`
     *     with loaded values assigned, or unchanged if loading failed.
     *     If no `out` param is set, returns the loaded save game or null if no save exists.
     */
    load(out?: any): any | null;
}

/**
 * Global save game provider manager that aggregates multiple save game providers
 *
 * Allows registering multiple services to automatically detect
 * available ones and fall back to others.
 */
class SaveGame
    extends AbstractGlobalProvider<SaveGameProvider>
    implements SaveGameProvider
{
    name = 'universal-savegame-provider';

    /**
     * Load save game data from the first provider that has saved data
     * @param out Optional object to merge loaded data into
     * @returns The loaded data or null if no saves were found
     */
    load(out?: any): any | null {
        for (const p of this.providers) {
            let v = p.load(out);
            if (v == null) continue;
            return v;
        }

        return null;
    }

    /**
     * Save game data to all registered providers
     * @param o The object to save
     */
    save(o: any): void {
        for (const p of this.providers) p.save(o);
    }
}

// Check if instance already exists in global registry
if (!(SAVE_GAME_PROVIDER_SYMBOL in globalThis)) {
    Object.defineProperty(globalThis, SAVE_GAME_PROVIDER_SYMBOL, {
        value: new SaveGame(),
        writable: false,
        configurable: false,
    });
}

/**
 * Global save game provider instance
 *
 * Use this to save and load game state across different storage providers.
 */
export const saveGame = (globalThis as any)[SAVE_GAME_PROVIDER_SYMBOL] as SaveGame;
