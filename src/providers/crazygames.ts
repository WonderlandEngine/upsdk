import {RewardedAdProvider, UserGesture} from '../advertising.js';
import {AnalyticsProvider} from '../analytics.js';
import {ExtraProvider} from '../extra.js';
import {SaveGameProvider} from '../savegame.js';
import {User, UserProvider} from '../user.js';

interface CrazyGamesUser {
    username: string;
    profilePictureUrl: string;
}

declare global {
    interface Window {
        CrazyGames: {
            SDK: {
                init(): Promise<void>;
                ad: {
                    hasAdblock(): Promise<boolean>;
                    requestAd(
                        type: 'rewarded' | 'midgame',
                        callbacks: {
                            adStarted: () => void;
                            adFinished: () => void;
                            adError: (error: {
                                code: 'unfilled' | 'other';
                                message: string;
                            }) => void;
                        }
                    ): Promise<boolean>;
                };
                game: {
                    loadingStart(): void;
                    loadingStop(): void;
                    gameplayStart(): void;
                    gameplayStop(): void;

                    happytime(): void;
                };
                user: {
                    getUser(): Promise<CrazyGamesUser>;
                    addAuthListener(listener: (user: CrazyGamesUser) => void): void;
                    showAuthPrompt(): Promise<CrazyGamesUser>;
                };

                data: {
                    clear(): void;
                    getItem(key: string): string | null;
                    removeItem(key: string): void;
                    setItem(key: string, value: string): void;
                };
            };
        };
    }
}

export class CrazyGamesProvider
    implements
        RewardedAdProvider,
        AnalyticsProvider,
        ExtraProvider,
        UserProvider,
        SaveGameProvider
{
    name = 'crazygames';

    hasAds = false;
    onReady: Promise<true>;
    ready = false;

    user: User | null = null;

    get isLoggedIn() {
        return this.user != null;
    }

    cgUser: CrazyGamesUser | null = null;

    constructor() {
        let resolveReady: (b: true) => void;
        let rejectReady: (error: any) => void;
        this.onReady = new Promise<true>((res, rej) => {
            resolveReady = res;
            rejectReady = rej;
        });

        const script = document.createElement('script');
        script.onerror = rejectReady;
        script.onload = async () => {
            await window.CrazyGames.SDK.init();

            window.CrazyGames.SDK.ad.hasAdblock().then((b) => (this.hasAds = b));

            window.CrazyGames.SDK.user.addAuthListener((user: CrazyGamesUser) => {
                this.cgUser = user;
                this.user = {
                    name: this.cgUser.username,
                    profilePictureUrl: this.cgUser.profilePictureUrl,
                };
            });

            this.ready = true;
            resolveReady(true);
        };
        script.type = 'text/javascript';
        script.src = 'https://sdk.crazygames.com/crazygames-sdk-v3.js';
        document.body.appendChild(script);
    }

    hasAd() {
        return this.ready && !this.hasAds;
    }

    showRewardedAd(userGesture: UserGesture): Promise<RewardedAdProvider> {
        if (!userGesture.isTrusted)
            throw new Error('Ads can only be shown on user gestures');

        const provider = this;
        return new Promise<RewardedAdProvider>((res, rej) => {
            const callbacks = {
                adFinished: () => res(provider),
                adError: (error: {code: 'unfilled' | 'other'; message: string}) => {
                    /* Ad not filled or error! */
                    switch (error.code) {
                        case 'unfilled':
                            rej(error.code);
                            break;
                        case 'other':
                            rej(error.message);
                            break;
                    }
                },
                adStarted: () => console.log('Start rewarded ad'),
            };
            window.CrazyGames.SDK.ad.requestAd('rewarded', callbacks);
        });
    }

    /* Analytics */

    trackGameplayStart(): void {
        window.CrazyGames.SDK.game.gameplayStart();
    }
    trackGameplayStop(): void {
        window.CrazyGames.SDK.game.gameplayStop();
    }

    trackLoadingStart(): void {
        window.CrazyGames.SDK.game.loadingStart();
    }
    trackLoadingStop(): void {
        window.CrazyGames.SDK.game.loadingStop();
    }

    /* User */
    requestLogin(): Promise<User> {
        return new Promise((res, rej) => {
            window.CrazyGames.SDK.user
                .showAuthPrompt()
                .then((user: CrazyGamesUser) => {
                    this.cgUser = user;
                    this.user = {
                        name: this.cgUser.username,
                        profilePictureUrl: this.cgUser.profilePictureUrl,
                    };
                    res(this.user);
                })
                .catch(rej);
        });
    }

    /* SaveGame */

    load(out?: any): any | null {
        out = out ?? {};
        const v = window.CrazyGames.SDK.data.getItem('save-game');
        if (v) {
            Object.assign(out, JSON.parse(v));
            return out;
        }
        return null;
    }

    save(o: any): void {
        window.CrazyGames.SDK.data.setItem('save-game', JSON.stringify(o));
    }

    /* Extra */

    celebrate(): void {
        window.CrazyGames.SDK.game.happytime();
    }
}
