import {AbstractGlobalProvider, Provider} from './provider.js';

const EXTRA_PROVIDER_SYMBOL = Symbol.for('@wonderlandengine/uber-sdk/extra-provider');

/**
 * Extra Provider
 * 
 * Interface for services that provide additional features like celebrations or effects.
 */
export interface ExtraProvider extends Provider {
    /**
     * Trigger a celebration effect
     */
    celebrate(): void;
}

/**
 * Global extra provider manager that aggregates multiple extra feature providers
 * 
 * Allows registering multiple services to trigger effects across all of them.
 */
class Extra extends AbstractGlobalProvider<ExtraProvider> implements ExtraProvider {
    name = 'uber-extra-provider';

    /**
     * Trigger celebration effects on all registered providers
     */
    celebrate(): void {
        for (const p of this.providers) p.celebrate();
    }
}

// Check if instance already exists in global registry
if (!(EXTRA_PROVIDER_SYMBOL in globalThis)) {
    Object.defineProperty(globalThis, EXTRA_PROVIDER_SYMBOL, {
        value: new Extra(),
        writable: false,
        configurable: false,
    });
}

/**
 * Global extra provider instance
 * 
 * Use this to trigger additional features like celebrations across different providers.
 */
export const extra = (globalThis as any)[EXTRA_PROVIDER_SYMBOL] as Extra;
