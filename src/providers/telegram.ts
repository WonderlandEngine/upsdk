import {User, UserProvider} from '../user.js';
import {init, retrieveLaunchParams, User as TelegramUser} from '@tma.js/sdk';

export interface TelegramConfig {
    apiId: string;
    apiHash: string;
}

export class TelegramProvider implements UserProvider {
    name = 'telegram';

    _user: User | null = null;
    tmaUser?: TelegramUser;

    constructor() {
        const {mainButton, viewport} = init();

        mainButton.on('click', () => viewport.expand());

        mainButton
            .setBackgroundColor('#ff0000')
            .setTextColor('#ffffff')
            .setText('Expand')
            .enable()
            .show();

        const {initData} = retrieveLaunchParams();
        this.tmaUser = initData?.user;
        this._user = {
            /* FIXME: Looks like tma.js has a bug here, firstName is not optional?
             * https://docs.telegram-mini-apps.com/platform/init-data#user
             */
            name: this.tmaUser?.firstName!,
            profilePictureUrl: this.tmaUser?.photoUrl,
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
