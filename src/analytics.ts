import { AbstractGlobalProvider, Provider } from './provider.js';

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
        for (const p of this.providers) p.trackLoadingStop();
    }
    trackLoadingStart(): void {
        for (const p of this.providers) p.trackLoadingStart();
    }
    trackLoadingStop(): void {
        for (const p of this.providers) p.trackLoadingStop();
    }
}

export const analytics = new Analytics();
