import {RewardedAdProvider, UserGesture} from '../advertising.js';

/* Global declared by the adinplay SDK */
declare class aipPlayer {
    constructor(config: {
        AIP_REWARDEDNOTGRANTED: (state: AdFailState) => void;
        AIP_REWARDEDGRANTED: () => void;
        AD_WIDTH: number;
        AD_HEIGHT: number;
        AD_DISPLAY: 'default' | 'fullscreen' | 'center' | 'modal-center' | 'fill';
        LOADING_TEXT: string;
        PREROLL_ELEM: () => void;
        AIP_COMPLETE: () => void;
    });
}

interface AIPTag {
    cmd?: {
        display?: (() => void)[];
        player?: (() => void)[];
    } & (() => void)[];

    adplayer?: aipPlayer;

    cmp?: {
        show: boolean;
        position: 'centered' | 'bottom'; //centered or bottom
        button: boolean;
        buttonText: 'Privacy settings';
        buttonPosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    };
}
declare var aiptag: AIPTag;

export interface AdInPlayConfig {}

type AdFailState = 'timeout' | 'empty' | 'unsupported' | 'closed';

export class AdInPlayAdProvider implements RewardedAdProvider {
    name = 'adinplay';
    options: AdInPlayConfig;

    reachedAdMax = false;

    /* Current promise functions */
    private rej?: (state: string) => void;
    private res?: (provider: RewardedAdProvider) => void;

    constructor(options: AdInPlayConfig) {
        this.options = options;

        const adDiv = document.createElement('div');
        adDiv.id = 'videoad';
        document.body.prepend(adDiv);

        const aiptag = (window.aiptag = (window.aiptag || {}) as AIPTag);
        aiptag.cmd = aiptag.cmd || [];
        aiptag.cmd!.display = aiptag.cmd!.display || [];
        aiptag.cmd!.player = aiptag.cmd!.player || [];
        aiptag.cmp = {
            show: true,
            position: 'centered', //centered or bottom
            button: true,
            buttonText: 'Privacy settings',
            buttonPosition: 'bottom-left', //bottom-left, bottom-right, top-left, top-right
        };

        const provider = this;

        const script = document.createElement('script');
        script.onload = () => {
            aiptag!.cmd!.player!.push(() => {
                aiptag.adplayer = new aipPlayer({
                    AIP_REWARDEDNOTGRANTED: (state: AdFailState) => {
                        if (state == 'unsupported') this.reachedAdMax = true;
                        if (this.rej) this.rej(state);
                    },
                    AIP_REWARDEDGRANTED: () => {
                        if (this.res) this.res(provider);
                    },
                    AD_WIDTH: 960,
                    AD_HEIGHT: 540,
                    AD_DISPLAY: 'default',
                    LOADING_TEXT: 'loading ad...',
                    PREROLL_ELEM: function () {
                        return document.getElementById('videoad');
                    },
                    AIP_COMPLETE: function () {},
                });
            });
        };
        script.async = true;
        script.src = '//api.adinplay.com/libs/aiptag/pub/XXXXX/tag.min.js';
        document.body.appendChild(script);
    }

    hasAd() {
        return !this.reachedAdMax;
    }

    showRewardedAd(userGesture: UserGesture): Promise<RewardedAdProvider> {
        if (!userGesture.isTrusted)
            throw new Error('Ads can only be shown on user gestures');

        //check if the adslib is loaded correctly or blocked by adblockers etc.
        if (window.aiptag.adplayer !== undefined) {
            return new Promise((res, rej) => {
                this.res = res;
                this.rej = rej;
                window.aiptag.cmd.player.push(() => {
                    window.aiptag.adplayer.startRewardedAd();
                });
            });
        } else {
            // Adlib didnt load this could be due to an adblocker, timeout etc.
            // Please add your script here that starts the content, this usually is the same script as added in AIP_REWARDEDCOMPLETE.
            this.reachedAdMax = true;
            return Promise.reject('ad-blocked');
        }
    }
}
