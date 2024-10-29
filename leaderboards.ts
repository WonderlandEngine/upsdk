import {AbstractGlobalProvider, Provider} from './provider';

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
 * Leadeboards Provider
 *
 * Interface for services that provide leaderboards.
 */
export interface LeaderboardsProvider extends Provider {
    /**
     * Post a score to the leaderboard.
     *
     * @param leaderboardId Id of the leaderboard.
     * @param score Score to post.
     * @return Promise that resolves to whether the score was higher than the last
     *         for this user, rejects when posting failed.
     */
    postScore(leaderboardId: string, score: number): Promise<boolean>;
    getScores(leaderboardId: string, maxCount: number): Promise<LeaderboardEntry[]>;
}

/**
 * Global {@link LeaderboardsProvider}.
 *
 * Allows registering multiple services to automatically detect
 * available ones and fall-back to others.
 *
 * Will post scores to all services, and retrieve scores from the first.
 */
class Leaderboards
    extends AbstractGlobalProvider<LeaderboardsProvider>
    implements LeaderboardsProvider
{
    name = 'uber-leaderboards-provider';

    postScore(leaderboardId: string, score: number): Promise<boolean> {
        return Promise.all(
            this.providers.map((p) => p.postScore(leaderboardId, score))
        ).then((wasBetter: boolean[]) => {
            /* The score was better only if it was better on all leaderboards */
            return wasBetter.reduce((a: boolean, b: boolean) => a && b, true);
        });
    }

    getScores(leaderboardId: string, maxCount: number): Promise<LeaderboardEntry[]> {
        if (!this.hasProviders())
            return Promise.reject(new Error('No providers available.'));
        return this.providers[this.providers.length - 1].getScores(leaderboardId, maxCount);
    }
}

export const leaderboards = new Leaderboards();
