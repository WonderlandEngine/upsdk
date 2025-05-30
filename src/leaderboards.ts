import {AbstractGlobalProvider, Provider} from './provider.js';

const LEADERBOARDS_PROVIDER_SYMBOL = Symbol.for(
    '@wonderlandengine/uber-sdk/leaderboards-provider'
);

/**
 * Represents a single entry in a leaderboard
 */
export interface LeaderboardEntry {
    /** When the leaderboard entry was created */
    createdAt?: Date;
    /** Rank on leaderboard, starting at 1 */
    rank: number;
    /** Score value */
    score: number;
    /** Who's entry this is */
    user: string;
}

/**
 * Leaderboards Provider
 *
 * Interface for services that provide leaderboards.
 */
export interface LeaderboardsProvider extends Provider {
    /**
     * Post a score to the leaderboard.
     *
     * @param leaderboardId Id of the leaderboard.
     * @param score Score to post.
     * @returns Promise that resolves to whether the score was higher than the last
     *         for this user, rejects when posting failed.
     */
    postScore(leaderboardId: string, score: number): Promise<boolean>;
    
    /**
     * Retrieve scores from a leaderboard
     * 
     * @param leaderboardId Id of the leaderboard
     * @param maxCount Maximum number of entries to retrieve
     * @returns Promise that resolves to an array of leaderboard entries
     */
    getScores(leaderboardId: string, maxCount: number): Promise<LeaderboardEntry[]>;
}

/**
 * Global leaderboards provider manager that aggregates multiple leaderboard providers
 *
 * Allows registering multiple services to automatically detect
 * available ones and fall back to others.
 *
 * Will post scores to all services, and retrieve scores from the first.
 */
class Leaderboards
    extends AbstractGlobalProvider<LeaderboardsProvider>
    implements LeaderboardsProvider
{
    name = 'uber-leaderboards-provider';

    /**
     * Post a score to all registered leaderboard providers
     * 
     * @param leaderboardId Id of the leaderboard
     * @param score Score to post
     * @returns Promise that resolves to true only if the score was better on all leaderboards
     */
    postScore(leaderboardId: string, score: number): Promise<boolean> {
        return Promise.all(
            this.providers.map((p) => p.postScore(leaderboardId, score))
        ).then((wasBetter: boolean[]) => {
            /* The score was better only if it was better on all leaderboards */
            return wasBetter.reduce((a: boolean, b: boolean) => a && b, true);
        });
    }

    /**
     * Get scores from the highest priority leaderboard provider
     * 
     * @param leaderboardId Id of the leaderboard
     * @param maxCount Maximum number of entries to retrieve
     * @returns Promise that resolves to an array of leaderboard entries
     * @throws Error if no providers are available
     */
    getScores(leaderboardId: string, maxCount: number): Promise<LeaderboardEntry[]> {
        if (!this.hasProviders())
            return Promise.reject(new Error('No providers available.'));
        return this.providers[this.providers.length - 1].getScores(leaderboardId, maxCount);
    }
}
// Check if instance already exists in global registry
if (!(LEADERBOARDS_PROVIDER_SYMBOL in globalThis)) {
    Object.defineProperty(globalThis, LEADERBOARDS_PROVIDER_SYMBOL, {
        value: new Leaderboards(),
        writable: false,
        configurable: false,
    });
}

/**
 * Global leaderboards provider instance
 * 
 * Use this to manage leaderboards across different backend providers.
 */
export const leaderboards = (globalThis as any)[
    LEADERBOARDS_PROVIDER_SYMBOL
] as Leaderboards;
