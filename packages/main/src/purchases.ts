import {AbstractGlobalProvider, Provider} from './provider.js';

const PURCHASES_PROVIDER_SYMBOL = Symbol.for(
    '@wonderlandengine/uber-sdk/purchases-provider'
);
/**
 * Purchases Provider
 *
 * Interface for services that provide in-app purchases and user inventory.
 */
export interface PurchasesProvider extends Provider {
    /**
     * Purchase item with given id.
     *
     * @param itemId Id of the item to purchase.
     * @param count Amount to buy, default `1`.
     * @returns Promise that resolves to `true` if item purchase was successful, `false` otherwise.
     */
    purchaseItem(itemId: string, count?: number): Promise<boolean>;

    /**
     * Check whether an item is purchased.
     *
     * @param itemId Id of the item to check
     * @returns True if the item has been purchased, false otherwise
     */
    isItemPurchased(itemId: string): boolean;

    /**
     * Get URL at which to purchase the item
     *
     * @param itemId Id of the item
     * @returns Promise that resolves to the purchase URL
     */
    getItemURL(itemId: string): Promise<string>;
}

/**
 * Global purchases provider manager that aggregates multiple purchase providers
 *
 * Allows registering multiple services to automatically detect
 * available ones and fall back to others.
 */
class Purchases
    extends AbstractGlobalProvider<PurchasesProvider>
    implements PurchasesProvider
{
    name = 'universal-purchases-provider';

    /**
     * Purchase an item using the highest priority provider
     *
     * @param itemId Id of the item to purchase
     * @param count Number of items to purchase, defaults to 1
     * @returns Promise that resolves to true if purchase was successful
     * @throws Error if no providers are available
     */
    purchaseItem(itemId: string, count?: number): Promise<boolean> {
        if (!this.hasProviders())
            return Promise.reject(new Error('No providers available.'));
        /* Only purchase from highest priority service */
        return this.providers[this.providers.length - 1].purchaseItem(itemId, count ?? 1);
    }

    /**
     * Get the purchase URL for an item from the highest priority provider
     *
     * @param itemId Id of the item
     * @returns Promise that resolves to the purchase URL
     * @throws Error if no providers are available
     */
    getItemURL(itemId: string): Promise<string> {
        if (!this.hasProviders())
            return Promise.reject(new Error('No providers available.'));
        return this.providers[this.providers.length - 1].getItemURL(itemId);
    }

    /**
     * Check if an item has been purchased in any of the registered providers
     *
     * @param itemId Id of the item to check
     * @returns True if the item is purchased in at least one provider
     */
    isItemPurchased(itemId: string): boolean {
        if (!this.hasProviders()) return false;
        /* Check all providers for purchase status */
        for (const p of this.providers) if (p.isItemPurchased(itemId)) return true;
        return false;
    }
}

// Check if instance already exists in global registry
if (!(PURCHASES_PROVIDER_SYMBOL in globalThis)) {
    Object.defineProperty(globalThis, PURCHASES_PROVIDER_SYMBOL, {
        value: new Purchases(),
        writable: false,
        configurable: false,
    });
}

/**
 * Global purchases provider instance
 *
 * Use this to manage in-app purchases across different payment providers.
 */
export const purchases = (globalThis as any)[PURCHASES_PROVIDER_SYMBOL] as Purchases;
