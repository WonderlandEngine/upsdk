import { RewardedAdProvider, UserGesture } from '../advertising.js';

export interface AppLixirConfig {
    /* Defaults to debug zone 2050 */
    zoneId?: number;
    /* Unique id to assign to this user */
    userId: string;
    accountId: number;
    siteId: number;
}

export interface ShowAdOptions extends AppLixirConfig {
    adStatusCb?: (status: string) => void;
}

/* Global function added by AppLixir SDK */
declare const invokeApplixirVideoUnit: (opts: ShowAdOptions) => void;

export class AppLixirAdProvider implements RewardedAdProvider {
    name = 'applixir';
    options: AppLixirConfig;

    reachedAdMax = false;

    constructor(options: AppLixirConfig) {
        this.options = options;
        this.options.zoneId = this.options.zoneId ?? 2050;

        const adDiv = document.createElement('div');
        adDiv.id = 'applixir_vanishing_div';
        adDiv.hidden = true;

        const adIframe = document.createElement('iframe');
        adIframe.id = 'applixir_parent';
        adDiv.appendChild(adIframe);

        document.body.prepend(adDiv);

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://cdn.applixir.com/applixir.sdk3.0m.js';
        document.body.appendChild(script);
    }

    hasAd() {
        return !this.reachedAdMax;
    }

    showRewardedAd(userGesture: UserGesture): Promise<RewardedAdProvider> {
        if (!userGesture.isTrusted)
            throw new Error('Ads can only be shown on user gestures');

        const provider = this;
        const options = {} as ShowAdOptions;
        Object.assign(options, this.options);
        return new Promise<RewardedAdProvider>((res, rej) => {
            options.adStatusCb = (status: string) => {
                switch (status) {
                    /* Cases in which we do nothing */
                    /* final message before the ad window is closed */
                    case 'sys-closing':
                    /* video ad initiated successfully */
                    case 'ad-initready':
                    /* the ad has loaded and is starting */
                    case 'ad-started':
                    /* The reward has been validated by the RMS system */
                    case 'ad-rewarded': // Already rewarded in ad-watched
                        break;

                    /* Cases in which we reward */

                    /* the ad was successfully played */
                    case 'ad-watched':
                        res(provider);
                        break;

                    /* Cases in which we stop offering ads */

                    /* An ad-blocker application is detected*/
                    case 'ad-blocker':
                    /* The RMS system has detected a user scripting to get rewards without ad revenue */
                    case 'ad-violation':
                    /* RMS tracking determined the user has received the maximum rewards in the past 24 hours */
                    case 'ad-maximum':
                        this.reachedAdMax = true;

                    /* Cases in which we just don't reward */

                    /* network or connectivity issues */
                    case 'network-error':
                    /* cross-origin resource error */
                    case 'cors-error':
                    /* the zone id is either missing or invalid */
                    case 'no-zoneid':
                    /* The ad was ended before the skip point */
                    case 'ad-interrupted':
                    /* no ads were returned to the player */
                    case 'ads-unavailable':
                        // TODO: Would be great to determine this in advance
                        break;
                    /* You returned an error from your RMS endpoint */
                    case 'ad-rejected':
                        rej(status);
                        break;
                }
            };
            invokeApplixirVideoUnit(options); //play the video ad
        });
    }
}
