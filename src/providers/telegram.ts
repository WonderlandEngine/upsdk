import {User, UserProvider} from '../user.js';
import {
    init,
    backButton,
    mainButton,
    viewport,
    retrieveLaunchParams,
    User as TelegramUser,
} from '@telegram-apps/sdk';

export interface TelegramConfig {
    apiId: string;
    apiHash: string;
}

export class TelegramProvider implements UserProvider {
    name = 'telegram';

    _user: User | null = null;
    tmaUser?: TelegramUser;

    constructor() {
        init();

        mainButton.mount();
        mainButton.onClick(() => {
            viewport.expand();
            mainButton.setParams({isVisible: false});
        });

        mainButton.setParams({
            backgroundColor: '#e8008a',
            textColor: '#ffffff',
            text: 'Expand',
            isEnabled: true,
            isVisible: true,
        });

        backButton.mount();
        const off = backButton.onClick(() => {
            off();
            window.history.back();
        });

        const initData = retrieveLaunchParams();
        this.tmaUser = initData?.tgWebAppData?.user;
        this._user = {
            name: this.tmaUser?.first_name!,
            profilePictureUrl: this.tmaUser?.photo_url,
        };
    }

    get user() {
        return this._user;
    }

    /* User */
    requestLogin(): Promise<User> {
        return this._user ? Promise.resolve(this._user) : Promise.reject();
    }

    get isLoggedIn() {
        return !!this._user;
    }
}
