import {AbstractGlobalProvider, Provider} from './provider.js';

const SAVE_GAME_PROVIDER_SYMBOL = Symbol.for(
    '@wonderlandengine/uber-sdk/save-game-provider'
);

/**
 * Save Game Provider
 *
 * Interface for services provinding ability to save and load game state.
 * Storage might be in the cloud or local.
 */
export interface SaveGameProvider extends Provider {
    /** Save an object to the save game storage */
    save(o: any): void;
    /**
     * Load an object from the save game storage
     *
     * The out param is a useful way to specify defaults.
     *
     * @param out Object to load the save game into, overwriting entries.
     * @returns `out` with loaded values assigned, or unchanged if loading failed.
     *     If no `out` param is set, the return value will be null or the save game.
     */
    load(out?: any): any | null;
}

/**
 * Global {@link SaveGameProvider}.
 *
 * Allows registering multiple services to automatically detect
 * available ones and fall-back to others.
 */
class SaveGame
    extends AbstractGlobalProvider<SaveGameProvider>
    implements SaveGameProvider
{
    name = 'uber-savegame-provider';

    load(out?: any): any | null {
        for (const p of this.providers) {
            let v = p.load(out);
            if (v == null) continue;
            return v;
        }

        return null;
    }

    save(o: any): void {
        for (const p of this.providers) p.save(o);
    }
}

if (!(SAVE_GAME_PROVIDER_SYMBOL in globalThis)) {
    Object.defineProperty(globalThis, SAVE_GAME_PROVIDER_SYMBOL, {
        value: new SaveGame(),
        writable: false,
        configurable: false,
    });
}
export const saveGame = (globalThis as any)[SAVE_GAME_PROVIDER_SYMBOL] as SaveGame;
