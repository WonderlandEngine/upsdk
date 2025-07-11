import {AbstractGlobalProvider, Provider} from './provider.js';

const ANALYTICS_PROVIDER_SYMBOL = Symbol.for(
    '@wonderlandengine/uber-sdk/analytics-provider'
);

/**
 * Analytics Provider
 *
 * Interface for services that provide analytics and telemetry tracking.
 */
export interface AnalyticsProvider extends Provider {
    /**
     * Track when gameplay starts
     */
    trackGameplayStart(): void;

    /**
     * Track when gameplay stops
     */
    trackGameplayStop(): void;

    /**
     * Track when loading begins
     */
    trackLoadingStart(): void;

    /**
     * Track when loading completes
     */
    trackLoadingStop(): void;
}

/**
 * Global analytics provider manager that aggregates multiple analytics providers
 *
 * Allows registering multiple analytics services to track events across all of them.
 */
class Analytics
    extends AbstractGlobalProvider<AnalyticsProvider>
    implements AnalyticsProvider
{
    name = 'universal-analytics-provider';

    /**
     * Track gameplay start event on all registered providers
     */
    trackGameplayStart(): void {
        for (const p of this.providers) p.trackGameplayStart();
    }

    /**
     * Track gameplay stop event on all registered providers
     */
    trackGameplayStop(): void {
        for (const p of this.providers) p.trackGameplayStop();
    }

    /**
     * Track loading start event on all registered providers
     */
    trackLoadingStart(): void {
        for (const p of this.providers) p.trackLoadingStart();
    }

    /**
     * Track loading stop event on all registered providers
     */
    trackLoadingStop(): void {
        for (const p of this.providers) p.trackLoadingStop();
    }
}

// Check if instance already exists in global registry
if (!(ANALYTICS_PROVIDER_SYMBOL in globalThis)) {
    Object.defineProperty(globalThis, ANALYTICS_PROVIDER_SYMBOL, {
        value: new Analytics(),
        writable: false,
        configurable: false,
    });
}

/**
 * Global analytics provider instance
 *
 * Use this to track analytics events across different analytics services.
 */
export const analytics = (globalThis as any)[ANALYTICS_PROVIDER_SYMBOL] as Analytics;
