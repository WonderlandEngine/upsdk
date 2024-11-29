import {User, UserProvider} from '../user.js';
import {heyVRSDK} from '@heyvr/sdk-types';
import {SaveGameProvider} from '../savegame.js';
import {LeaderboardEntry, LeaderboardsProvider} from '../leaderboards.js';
import {PurchasesProvider} from '../purchases.js';
import {Emitter} from '@wonderlandengine/api';

declare global {
    interface Window {
        heyVR: heyVRSDK;
    }
}

export class HeyVRProvider
    implements UserProvider, SaveGameProvider, LeaderboardsProvider, PurchasesProvider
{
    name = 'heyvr';

    _user: User | null = null;
    _gameId: string;

    available = false;

    /**
     * Constructor
     *
     * @param debug Whether to use HeyVR's debug SDK.
     */
    constructor(gameId: string, debug?: boolean) {
        this._gameId = gameId;
        if (debug) {
            this.available = true;

            const script = document.createElement('script');
            script.crossOrigin = 'no-cors';
            script.src = 'https://static.heyvr.io/sdk/heyvr/latest.sandbox.js';
            script.onload = () => this.onInit();
            document.head.appendChild(script);
            return;
        }

        if (window.location.hostname !== 'games.heyvr.io') return;
        this.available = true;

        /* Sometimes the SDK loads with heyVR.vr and no other properties */
        if (window.heyVR?.user) {
            this.onInit();
        } else {
            window.addEventListener('heyVR.SDKLoaded', this.onInit.bind(this));
        }
    }

    get user() {
        return this._user;
    }

    /* User */

    get isLoggedIn() {
        return !!this._user;
    }

    _onReadyResolve!: () => void;
    _onReadyReject!: (error: Error) => void;
    onReady: Promise<void> = new Promise((res, rej) => {
        this._onReadyResolve = res;
        this._onReadyReject = rej;
    });

    onAuthChange: Emitter<[boolean]> = new Emitter<[boolean]>();

    ready: boolean = false;

    ownedItems: string[] = [];

    isReady(): boolean {
        return this.ready;
    }

    async onInit() {
        /* Handle external auth changes */
        window.heyVR.user.onAuthChange((e) => {
            if (e.loggedIn) {
                this._user = {name: e.username};
            } else {
                this._user = null;
            }
        });

        /* Get initial logged-in state */
        const isLoggedIn = await window.heyVR.user.isLoggedIn();
        if (isLoggedIn) this.onLoggedIn();
        else throw Error('Not logged in');
    }

    async requestLogin(): Promise<User> {
        if (this._user) return Promise.resolve(this._user);
        const res = await window.heyVR.user.openLogin();
        this._user = {
            name: res.username,
        };
        this.onLoggedIn();

        return this._user;
    }

    onLoggedIn() {
        const p0 = window.heyVR.user
            .getName()
            .then((name) => {
                if (!this._user) this._user = {name};
                else this._user.name = name;
            })
            .catch(console.error);

        const p3 = window.heyVR.inventory.get().then((items) => {
            this.ownedItems = items.map((i) => i.slug);
        });

        Promise.all([p0, p3]).then(() => {
            this.ready = true;
            this._onReadyResolve();
        });
    }

    save(o: any, slot?: number): Promise<boolean> {
        return this.onReady.then(() => {
            //@ts-ignore
            if (this.isLoggedIn) return window.heyVR.saveGame.write(o, true, slot);
            return false;
        });
    }

    load(out?: any, slot: number = 1): Promise<any | null> {
        return this.onReady
            .then(() => {
                if (this.isLoggedIn) return window.heyVR.saveGame.all();
                else return null;
            })
            .then((s) => {
                if (s && slot.toString() in s) {
                    return window.heyVR.saveGame.load(slot);
                } else {
                    return null;
                }
            })
            .then((o) => {
                if (!o) return out ?? null;
                return Object.assign(out ?? {}, o);
            });
    }

    isItemPurchased(itemId: string) {
        return this.ownedItems.includes(itemId);
    }

    async purchaseItem(itemId: string, count?: number) {
        const success = await window.heyVR.inventory.purchase(itemId, count ?? 1);
        if (success) {
            this.ownedItems.push(itemId);
        }
        return !!success;
    }

    getScores(leaderboardId: string, maxCount: number): Promise<LeaderboardEntry[]> {
        return this.onReady.then(() => {
            if (this.isLoggedIn)
                return window.heyVR.leaderboard.getMy(leaderboardId, maxCount).then((s) => {
                    return s.map((s) => ({
                        user: s.user,
                        rank: s.rank,
                        score: s.score,
                        updatedAt: s.created_at,
                    }));
                });
            else return [];
        });
    }

    postScore(leaderboardId: string, score: number): Promise<boolean> {
        return window.heyVR.leaderboard.postScore(leaderboardId, score);
    }

    getItemURL(itemId: string): Promise<string> {
        // TODO this doesn't support cross-game items.
        return window.heyVR.inventory.getItemURL(this._gameId, itemId);
    }
}
