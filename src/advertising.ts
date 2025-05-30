import {AbstractGlobalProvider, Provider} from './provider.js';

const ADVERTISING_PROVIDER_SYMBOL = Symbol.for(
    '@wonderlandengine/uber-sdk/advertising-provider'
);

/** A user event that is allowed to trigger an ad */
export type UserGesture = MouseEvent | SubmitEvent | PointerEvent | TouchEvent;

export enum AdError {
    Unfilled = 'unfilled',
}

export interface RewardedAdProvider extends Provider {
    /** Whether there is an ad to show */
    hasAd(): boolean;
    /**
     * Launches a rewarded video ad.
     * Returned promise resolves if the user finished watching the ad
     * and rejects if an error ocurs, ad blocker is deteced or in any
     * other case.
     */
    showRewardedAd(userGesture: UserGesture): Promise<RewardedAdProvider>;

    /**
     * Launches a midgame video ad.
     * Returned promise resolves if the user finished watching the ad
     * and rejects if an error ocurs, ad blocker is deteced or in any
     * other case.
     */
    showMidgameAd(userGesture: UserGesture): Promise<RewardedAdProvider>;
}

class Ads extends AbstractGlobalProvider<RewardedAdProvider> implements RewardedAdProvider {
    name = 'uber-ad-provider';

    hasAd(): boolean {
        for (const p of this.providers) {
            if (p.hasAd()) return true;
        }
        return false;
    }

    showRewardedAd(userGesture: UserGesture): Promise<RewardedAdProvider> {
        for (const p of this.providers) {
            if (p.hasAd()) return p.showRewardedAd(userGesture);
        }
        return Promise.reject({status: 'ads-unavailable', provider: this});
    }

    showMidgameAd(userGesture: UserGesture): Promise<RewardedAdProvider> {
        for (const p of this.providers) {
            if (p.hasAd()) return p.showMidgameAd(userGesture);
        }
        return Promise.reject({status: 'ads-unavailable', provider: this});
    }
}

// Check if instance already exists in global registry
if (!(ADVERTISING_PROVIDER_SYMBOL in globalThis)) {
    Object.defineProperty(globalThis, ADVERTISING_PROVIDER_SYMBOL, {
        value: new Ads(),
        writable: false,
        configurable: false,
    });
}

export const ads = (globalThis as any)[ADVERTISING_PROVIDER_SYMBOL] as Ads;
