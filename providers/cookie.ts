import {SaveGameProvider} from '../savegame.js';

/**
 * Store a cookie
 *
 * @param cname Name of the cookie to save
 * @param cvalue Value to store in the cookie
 * @param exdays Expiration in days
 */
export function setCookie(cname: string, cvalue: string, exdays: number) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

/**
 * Retrieve a cookie
 *
 * @param cname Name of the cookie to load
 */
export function getCookie(cname: string) {
    let name = cname + '=';
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

/**
 * Save Game stored in local cookies.
 *
 * Stores save game objects as JSON strings in cookies
 * with given cookie name..
 */
export class CookieSaveGameProvider implements SaveGameProvider {
    cookieKey: string;

    /**
     * Constructor
     *
     * @param cookie Name of the cookie to store the save game in
     */
    constructor(cookie: string = 'save-game') {
        this.cookieKey = cookie;
    }

    save(o: any): void {
        setCookie(this.cookieKey, JSON.stringify(o), 365);
    }

    load(out?: any): string | null {
        out = out ?? {};
        const cookie = getCookie(this.cookieKey);
        const value = cookie ? JSON.parse(cookie) : null;
        if (!value) return null;
        Object.assign(out, value);
        return out;
    }
}
