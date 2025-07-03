import {RewardedAdProvider, UserGesture, AnalyticsProvider} from '@wonderlandengine/upsdk';

declare global {
    interface Window {
        PokiSDK: any;
    }
}

export class PokiProvider implements RewardedAdProvider, AnalyticsProvider {
    name = 'poki';
    onReady: Promise<true>;
    hasAds = false;
    ready = false;

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
            await window.PokiSDK.init()
                .then(() => {
                    console.log('Poki SDK successfully initialized');
                    // fire your function to continue to game

                    this.ready = true;
                    resolveReady(true);
                })
                .catch(() => {
                    console.log('Initialized, something went wrong, load you game anyway');
                    // fire your function to continue to game
                });
        };

        script.type = 'text/javascript';
        script.src = 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js';
        document.body.appendChild(script);
    }
    hasAd(): boolean {
        return this.ready && !this.hasAds;
    }

    showRewardedAd(userGesture: UserGesture): Promise<RewardedAdProvider> {
        if (!userGesture.isTrusted) {
            throw new Error('Ads can only be shown on user gestures');
        }
        return new Promise<RewardedAdProvider>(async (resolve, reject) => {
            try {
                const success = window.PokiSDK.rewardedBreak();
                if (success) {
                    resolve(this);
                } else {
                    reject({status: 'unfilled', provider: this});
                }
            } catch (e) {
                reject({status: 'Unknown message', provider: this});
            }
        });
    }
    showMidgameAd(userGesture: UserGesture): Promise<RewardedAdProvider> {
        if (!userGesture.isTrusted) {
            throw new Error('Ads can only be shown on user gestures');
        }
        return new Promise<RewardedAdProvider>(async (resolve, reject) => {
            try {
                const success = window.PokiSDK.commercialBreak();
                if (success) {
                    resolve(this);
                } else {
                    reject({status: 'unfilled', provider: this});
                }
            } catch (e) {
                reject({status: 'Unknown message', provider: this});
            }
        });
    }

    trackGameplayStart(): void {
        window.PokiSDK.gameplayStart();
    }
    trackGameplayStop(): void {
        window.PokiSDK.gameplayStop();
    }
    trackLoadingStart(): void {}
    trackLoadingStop(): void {
        window.PokiSDK.gameLoadingFinished();
    }
}
