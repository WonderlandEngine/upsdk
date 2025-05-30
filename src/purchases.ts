import {AbstractGlobalProvider, Provider} from './provider.js';

const PURCHASES_PROVIDER_SYMBOL = Symbol.for(
    '@wonderlandengine/uber-sdk/purchases-provider'
);
/**
 * Purchases Provider
 *
 * Interface for services that provide in-app purchases and user invetory.
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
     */
    isItemPurchased(itemId: string): boolean;

    /**
     * Get URL at which to purchase the item
     */
    getItemURL(itemId: string): Promise<string>;
}

/**
 * Global {@link PurchasesProvider}.
 *
 * Allows registering multiple services to automatically detect
 * available ones and fall-back to others.
 */
class Purchases
    extends AbstractGlobalProvider<PurchasesProvider>
    implements PurchasesProvider
{
    name = 'uber-purchases-provider';

    purchaseItem(itemId: string, count?: number): Promise<boolean> {
        if (!this.hasProviders())
            return Promise.reject(new Error('No providers available.'));
        /* Only purchase from highest priority service */
        return this.providers[this.providers.length - 1].purchaseItem(itemId, count ?? 1);
    }
    getItemURL(itemId: string): Promise<string> {
        if (!this.hasProviders())
            return Promise.reject(new Error('No providers available.'));
        return this.providers[this.providers.length - 1].getItemURL(itemId);
    }

    isItemPurchased(itemId: string): boolean {
        if (!this.hasProviders()) return false;
        /* Only purchase from highest priority service */
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

export const purchases = (globalThis as any)[PURCHASES_PROVIDER_SYMBOL] as Purchases;
