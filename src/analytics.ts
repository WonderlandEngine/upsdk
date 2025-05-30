import {AbstractGlobalProvider, Provider} from './provider.js';

const ANALYTICS_PROVIDER_SYMBOL = Symbol.for(
    '@wonderlandengine/uber-sdk/analytics-provider'
);

export interface AnalyticsProvider extends Provider {
    trackGameplayStart(): void;
    trackGameplayStop(): void;

    trackLoadingStart(): void;
    trackLoadingStop(): void;
}

class Analytics
    extends AbstractGlobalProvider<AnalyticsProvider>
    implements AnalyticsProvider
{
    name = 'uber-analytics-provider';

    trackGameplayStart(): void {
        for (const p of this.providers) p.trackGameplayStart();
    }
    trackGameplayStop(): void {
        for (const p of this.providers) p.trackGameplayStop();
    }
    trackLoadingStart(): void {
        for (const p of this.providers) p.trackLoadingStart();
    }
    trackLoadingStop(): void {
        for (const p of this.providers) p.trackLoadingStop();
    }
}

if (!(ANALYTICS_PROVIDER_SYMBOL in globalThis)) {
    Object.defineProperty(globalThis, ANALYTICS_PROVIDER_SYMBOL, {
        value: new Analytics(),
        writable: false,
        configurable: false,
    });
}

export const analytics = (globalThis as any)[ANALYTICS_PROVIDER_SYMBOL] as Analytics;
