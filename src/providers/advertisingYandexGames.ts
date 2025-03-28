import {RewardedAdProvider, UserGesture} from '../advertising.js';

type AdFailState = 'timeout' | 'empty' | 'unsupported' | 'closed';

declare interface YSDK {
    adv: {
        showFullscreenAdv(params: {
            /* Optional callback functions. They are configured individually for each ad unit. */
            callbacks: {
                /* Called when the video ad is shown on the screen */
                onOpen?: () => void;
                /* Called when the ad closes, after an error, or after an
                 * ad failed to open due to too frequent calls. It's used
                 * with the wasShown argument (boolean type), the value of
                 * which indicates whether the ad was shown or not. */
                onClose?: (wasShown: boolean) => void;
                /* Called when an error occurs. The error object is passed to the callback function. */
                onError?: (e: string) => void;
            };
        }): void;
        showRewardedVideo(params: {
            /* Optional callback functions. They are configured individually for each ad unit. */
            callbacks: {
                /* Called when the video ad is shown on the screen. */
                onOpen?: () => void;
                /* Called when a video ad impression is counted. This function should specify a reward for viewing the ad. */
                onRewarded?: () => void;
                /* Called when the video ad closes. */
                onClose?: () => void;
                /* Called when an error occurs. The error object is passed to the callback function. */
                onError?: (e: string) => void;
            };
        }): void;
    };
}
declare global {
    var YaGames: {
        init(): Promise<YSDK>;
    };
}

interface AdInPlayConfig {
    appId: 'bla';
}

export class YandexGamesAdProvider implements RewardedAdProvider {
    name = 'yandex-games-ads';
    options: AdInPlayConfig;

    reachedAdMax = false;

    /* Current promise functions */
    private rej?: (state: string) => void;
    private res?: (provider: RewardedAdProvider) => void;

    ysdk?: YSDK;

    constructor(options: AdInPlayConfig) {
        this.options = options;

        const provider = this;
        const script = document.createElement('script');
        script.onload = () => {
            YaGames.init().then((ysdk: YSDK) => {
                provider.ysdk = ysdk;
            });
        };
        script.src = 'https://yandex.ru/games/sdk/v2';
        document.body.appendChild(script);
    }

    hasAd() {
        return !this.reachedAdMax;
    }

    showRewardedAd(userGesture: UserGesture): Promise<RewardedAdProvider> {
        if (!userGesture.isTrusted)
            throw new Error('Ads can only be shown on user gestures');
        const provider = this;

        return new Promise((res, rej) => {
            provider.ysdk!.adv.showRewardedVideo({
                callbacks: {
                    onRewarded: () => {
                        res(provider);
                    },
                    onClose: () => {
                        console.log('Video ad closed.');
                    },
                    onError: (e: string) => {
                        console.log('Error while open video ad:', e);
                    },
                },
            });
        });
    }
}
