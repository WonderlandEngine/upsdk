import {User, UserProvider} from '@wonderlandengine/upsdk';

// declare the Editor global (injected by Wonderland Engine)
declare global {
    interface Window {
        WL_EDITOR?: boolean;
    }
}

const TestAvatar =
    'https://avatar.viverse.com/api/meetingareaselector/v2/newgenavatar/avatars/7ef6c8c74d60a788eadc4ad2d0d01700c4971242c00f8e7074ed6908a88517ea2b69/files?filetype=model&lod=original';

export interface ViverseConfig {
    appId: string;
    debug: boolean;
}

interface ViverseClient {
    loginWithWorlds(args: {state?: string}): ViverseClient;
    checkAuth(): Promise<boolean>;
    getToken(): Promise<string | null>;
}

type Avatar = {vrmUrl: string};

interface ProfileData {
    name: string;
    activeAvatar: Avatar | null;
}
interface ViverseAvatarClient {
    getProfile(): Promise<ProfileData>;
}

declare global {
    interface Window {
        viverse: {
            client: new (args: {clientId: string; domain: string}) => ViverseClient;
            avatar: new (args: {baseURL: string; token: string}) => ViverseAvatarClient;
        };
    }
}

export class ViverseProvider implements UserProvider {
    name = 'viverse';
    private _config: ViverseConfig;

    private _user: User | null = null;
    private _avatarClient?: ViverseAvatarClient;
    private _sdkLoaded: Promise<void>;

    constructor(config: ViverseConfig) {
        this._config = config;

        // Immediately append SDK script (but do not init)
        this._sdkLoaded = new Promise<void>((resolve, reject) => {
            // editor or debug skip script load
            if (window.WL_EDITOR || config.debug) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.crossOrigin = 'anonymous';
            script.defer = true;
            script.src =
                'https://www.viverse.com/static-assets/viverse-sdk/1.2.9/viverse-sdk.umd.js';
            script.onload = () => resolve();
            script.onerror = (e) => reject(e);
            document.head.appendChild(script);
        });
    }

    /**
     * Delays SDK init and profile fetch until explicitly called
     */
    async requestLogin(): Promise<User> {
        // return early if already logged in
        if (this._user) return this._user;

        // editor or debug shortcut
        if (window.WL_EDITOR || this._config.debug) {
            const fake: User = {
                name: this._config.debug ? 'DebugUser' : 'Editor User',
                avatarUrl: TestAvatar,
            };
            this._user = fake;
            return fake;
        }

        // wait for SDK script to be loaded
        await this._sdkLoaded;

        // initialize via SDK
        const client = new window.viverse.client({
            clientId: this._config.appId,
            domain: 'account.htcvive.com',
        });

        const isAuth = await client.checkAuth();
        if (!isAuth) {
            client.loginWithWorlds({state: '{}'});
            throw new Error('Not authenticated');
        }

        const token = await client.getToken();
        if (!token) throw new Error('Token retrieval failed');

        this._avatarClient = new window.viverse.avatar({
            baseURL: 'https://sdk-api.viverse.com/',
            token,
        });

        // fetch profile
        const profileData = await this._avatarClient.getProfile();
        const name = profileData.name;
        const avatarUrl = profileData.activeAvatar?.vrmUrl;
        if (!name || !avatarUrl) throw new Error('Invalid profile data');

        const user: User = {name, avatarUrl};
        this._user = user;
        return user;
    }

    get user(): User | null {
        return this._user;
    }

    get isLoggedIn(): boolean {
        return !!this._user;
    }
}
