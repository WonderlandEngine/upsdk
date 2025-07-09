# Viverse Provider

This package provides integration with the Viverse platform for the Wonderland UpSDK.

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-viverse
```

## Usage

```javascript
import {ViverseProvider} from '@wonderlandengine/upsdk-provider-viverse';
const provider = new ViverseProvider({
    appId: 'your-viverse-app-id',
    debug: true, // Optional, for debugging purposes
});

const user = await provider.requestLogin();
```

## Configuration

| Option  | Type      | Description                                       |
| ------- | --------- | ------------------------------------------------- |
| `appId` | `string`  | Your unique viverse application id.               |
| `debug` | `boolean` | Optional, enables loading dummy data for testing. |

## Methods

- `requestLogin()`: Requests the user to log in to the viverse worlds, returns a promise that resolves with the user object.
- `user`: Returns the current user object if logged in, otherwise null. User object contains name and avatarUrl.
- `isLoggedIn`: Checks if the user is logged in to the viverse worlds, returns a boolean.

## Example Component

An example component that work along with the core api <https://www.npmjs.com/package/@wonderlandengine/upsdk> to manage and load user avatar into the scene :

this requires installation of core api package as well.

```bash
npm install @wonderlandengine/upsdk-provider
```

```typescript
/*
 * This typescript component initializes the Viverse provider and load the user's avatar to scene.
 */
import {Component} from '@wonderlandengine/api';
import {property} from '@wonderlandengine/api/decorators.js';
import {user, User} from '@wonderlandengine/upsdk';
import {ViverseProvider} from '@wonderlandengine/upsdk-provider-viverse';

/**
 * viverse-provider
 */
export class ViverseProviderComponent extends Component {
    static TypeName = 'viverse-provider-component';

    /* Properties that are configurable in the editor */

    /**provide your applicationID on editor or as a secure Env_Variable*/
    @property.string()
    applicationId: string;

    @property.bool(false)
    debug: boolean;

    _user: User | null = null;

    init(): void {
        //you can do this on index.ts for production
        const provider = new ViverseProvider({
            appId: this.applicationId,
            debug: this.debug,
        });

        user.registerProvider(provider);
    }

    async start() {
        if (!user.isLoggedIn) {
            this._user = await user.requestLogin();
            this.setupAvatar(this._user);
            return;
        }
    }

    async setupAvatar(userObj: User) {
        const vrmUrl = userObj.avatarUrl;
        const object = this.object.addChild();

        const prefab = await this.engine.loadGLTF({
            url: vrmUrl,
            extensions: true,
        });
        const {root} = this.engine.scene.instantiate(prefab);
        root.children.forEach((child) => (child.parent = object));
    }
}
```

## License

MIT
