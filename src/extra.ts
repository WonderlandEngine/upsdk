import {AbstractGlobalProvider, Provider} from './provider.js';

const EXTRA_PROVIDER_SYMBOL = Symbol.for('@wonderlandengine/uber-sdk/extra-provider');

export interface ExtraProvider extends Provider {
    celebrate(): void;
}

class Extra extends AbstractGlobalProvider<ExtraProvider> implements ExtraProvider {
    name = 'uber-extra-provider';

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

export const extra = (globalThis as any)[EXTRA_PROVIDER_SYMBOL] as Extra;
