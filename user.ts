import {Emitter} from '@wonderlandengine/api';
import {AbstractGlobalProvider, Provider} from './provider';

/** A logged in user */
export interface User {
    name: string;
    profilePictureUrl?: string;
}

/** Interface for services that provide user accounts */
export interface UserProvider extends Provider {
    isLoggedIn: boolean;
    user: User | null;

    requestLogin(): Promise<User>;

    onAuthChange?: Emitter<[boolean]>;
}

class UserProviderManager
    extends AbstractGlobalProvider<UserProvider>
    implements UserProvider
{
    name = 'uber-user-provider';

    onAuthChange = new Emitter<[boolean]>();

    providers: UserProvider[] = [];
    registerProvider(p: UserProvider) {
        this.providers.push(p);
        /* Forward onAuthChange events */
        if (p.onAuthChange)
            p.onAuthChange.add(this.onAuthChange.notify.bind(this.onAuthChange));
    }

    get isLoggedIn() {
        for (let u of this.providers) if (u.isLoggedIn) return true;
        return false;
    }

    get user(): User | null {
        for (let u of this.providers) if (u.isLoggedIn) return u.user;
        return null;
    }

    requestLogin(): Promise<User> {
        for (let u of this.providers) if (!u.isLoggedIn) return u.requestLogin();
        return Promise.reject();
    }
}

export const user = new UserProviderManager();
