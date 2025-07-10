import {Emitter} from '@wonderlandengine/api';
import {AbstractGlobalProvider, Provider} from './provider.js';

// Use a global symbol to ensure singleton across contexts
const USER_PROVIDER_SYMBOL = Symbol.for('@wonderlandengine/uber-sdk/user-provider');

/** A logged in user */
export interface User {
    /** Display name of the user */
    name: string;
    /** URL to the user's profile picture */
    profilePictureUrl?: string;
    /** Optional URL to avatar model */
    avatarUrl?: string;
}

/** Interface for services that provide user accounts */
export interface UserProvider extends Provider {
    /** Whether a user is currently logged in */
    isLoggedIn: boolean;
    /** The currently logged in user, or null if not logged in */
    user: User | null;

    /**
     * Request the user to log in
     * @returns A promise that resolves with the logged in user
     * @throws If login fails or is cancelled
     */
    requestLogin(): Promise<User>;

    /** Emitter that fires when authentication state changes */
    onAuthChange?: Emitter<[boolean]>;
}

/**
 * Global user provider manager that aggregates multiple user providers
 */
class UserProviderManager
    extends AbstractGlobalProvider<UserProvider>
    implements UserProvider
{
    name = 'uber-user-provider';

    /** Emitter that fires when any provider's authentication state changes */
    onAuthChange = new Emitter<[boolean]>();

    providers: UserProvider[] = [];

    /**
     * Register a new user provider
     * @param p The user provider to register
     */
    registerProvider(p: UserProvider) {
        this.providers.push(p);
        /* Forward onAuthChange events */
        if (p.onAuthChange)
            p.onAuthChange.add(this.onAuthChange.notify.bind(this.onAuthChange));
    }

    /**
     * Check if any provider has a logged in user
     * @returns True if at least one provider has a logged in user
     */
    get isLoggedIn() {
        for (let u of this.providers) if (u.isLoggedIn) return true;
        return false;
    }

    /**
     * Get the first logged in user from any provider
     * @returns The logged in user or null if no user is logged in
     */
    get user(): User | null {
        for (let u of this.providers) if (u.isLoggedIn) return u.user;
        return null;
    }

    /**
     * Request login from the first provider that doesn't have a logged in user
     * @returns A promise that resolves with the logged in user
     * @throws If no providers are available or login fails
     */
    requestLogin(): Promise<User> {
        for (let u of this.providers) if (!u.isLoggedIn) return u.requestLogin();
        return Promise.reject();
    }
}

// Check if instance already exists in global registry
if (!(USER_PROVIDER_SYMBOL in globalThis)) {
    Object.defineProperty(globalThis, USER_PROVIDER_SYMBOL, {
        value: new UserProviderManager(),
        writable: false,
        configurable: false,
    });
}

export const user = (globalThis as any)[USER_PROVIDER_SYMBOL] as UserProviderManager;
