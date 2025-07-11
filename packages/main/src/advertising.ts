import {AbstractGlobalProvider, Provider} from './provider.js';

const ADVERTISING_PROVIDER_SYMBOL = Symbol.for(
    '@wonderlandengine/uber-sdk/advertising-provider'
);

/** A user event that is allowed to trigger an ad */
export type UserGesture = MouseEvent | SubmitEvent | PointerEvent | TouchEvent;

/**
 * Enumeration of possible ad errors
 */
export enum AdError {
    /** No ad inventory available to show */
    Unfilled = 'unfilled',
}

/**
 * Rewarded Ad Provider
 *
 * Interface for services that provide rewarded and midgame video advertisements.
 */
export interface RewardedAdProvider extends Provider {
    /**
     * Check whether there is an ad available to show
     * @returns True if an ad is available
     */
    hasAd(): boolean;
    /**
     * Launches a rewarded video ad.
     *
     * @param userGesture A user gesture event that triggered the ad request
     * @returns Promise that resolves with the provider if the user finished watching the ad,
     *          rejects if an error occurs, ad blocker is detected or in any other failure case
     */
    showRewardedAd(userGesture: UserGesture): Promise<RewardedAdProvider>;

    /**
     * Launches a midgame video ad.
     *
     * @param userGesture A user gesture event that triggered the ad request
     * @returns Promise that resolves with the provider if the user finished watching the ad,
     *          rejects if an error occurs, ad blocker is detected or in any other failure case
     */
    showMidgameAd(userGesture: UserGesture): Promise<RewardedAdProvider>;
}

/**
 * Global advertising provider manager that aggregates multiple ad providers
 *
 * Shows ads from the first provider that has available inventory.
 */
class Ads extends AbstractGlobalProvider<RewardedAdProvider> implements RewardedAdProvider {
    name = 'universal-ad-provider';

    /**
     * Check if any provider has an ad available
     * @returns True if at least one provider has an ad available
     */
    hasAd(): boolean {
        for (const p of this.providers) {
            if (p.hasAd()) return true;
        }
        return false;
    }

    /**
     * Show a rewarded ad from the first provider with available inventory
     *
     * @param userGesture User gesture that triggered the ad request
     * @returns Promise that resolves if the ad was watched completely
     * @throws Object with status 'ads-unavailable' if no ads are available
     */
    showRewardedAd(userGesture: UserGesture): Promise<RewardedAdProvider> {
        for (const p of this.providers) {
            if (p.hasAd()) return p.showRewardedAd(userGesture);
        }
        return Promise.reject({status: 'ads-unavailable', provider: this});
    }

    /**
     * Show a midgame ad from the first provider with available inventory
     *
     * @param userGesture User gesture that triggered the ad request
     * @returns Promise that resolves if the ad was watched completely
     * @throws Object with status 'ads-unavailable' if no ads are available
     */
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

/**
 * Global advertising provider instance
 *
 * Use this to show ads across different advertising networks.
 */
export const ads = (globalThis as any)[ADVERTISING_PROVIDER_SYMBOL] as Ads;
