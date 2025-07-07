# Abstraction SDK for Web Games Platform Services

## Providers

[i]: ## "Implemented."
[n]: ## "Not implemented."
[u]: ## "Used in production."

| **Platform**                                                                                | **Advertising** | **Analytics** | **Extra** | **Leaderboards** | **Purchases** | **SaveGame** | **User** |
| ------------------------------------------------------------------------------------------- | -------------- | ------------- | --------- | ---------------- | ------------- | ------------ | -------- |
| [HeyVR](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-heyvr)               | [✅][u]        |               |           | [✅][u]         | [✅][u]       | [✅][u]      | [✅][u]  |
| [CrazyGames](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-crazygames)     | [✅][u]        | [✅][u]       | [✅][u]   | N/A             | [❌][n]       | [✅][u]      | [✅][u]  |
| [Poki](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-poki)                 | [🟡][i]        | [🟡][i]       |    |              |        |       |   |
| [AdInPlay](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-adinplay)         | [🟡][i]        | N/A           | N/A       | N/A              | N/A           | N/A          | N/A      |
| [Applixir](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-applixir)         | [🟡][i]        | N/A           | N/A       | N/A              | N/A           | N/A          | N/A      |
| [Yandex Games](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-yandexgames)  | [🟡][i]        | [❌][n]       | [❌][n]   |  [❌][n]        | [❌][n]       | [❌][n]      | [❌][n]  |
| [Telegram](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-telegram)         |                |               |           |                  |               |              | [🟡][i]  |
| [Cookie](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-cookie)             |                |               |           |                  |               | [✅][u]      |          |
| [LocalStorage](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-localstorage) |                |               |           |                  |               | [🟡][i]      |          |
| Discord Activities                                                                          |                |               |           |                  |               |              |          |

## How to Use

The SDK is designed to allow multiple platforms at the same time, choosing whichever is available
and allowing to provide fallbacks, e.g. to cookies, if no logged-in service is available.

The services you want to support need to be registered to "global providers". These global
providers can be used from anywhere in the code:

```ts
import {saveGame} from '@wonderlandengine/upsdk';

saveGame.save({level: 42});
```

### Register Providers

To register a provider, run this code as early as possible:

```ts
import {saveGame, user, leaderboards} from '@wonderlandengine/upsdk';
import {HeyVRProvider} from '@wonderlandengine/upsdk-provider-heyvr';
import {CookieSaveGameProvider} from '@wonderlandengine/upsdk-provider-cookie';

/* Registering a provider is simple */
saveGame.register(new CookieSaveGameProvider());

/* Many providers support multiple services, register them to the ones you use: */
const heyVR = new HeyVRProvider('your-game-id');
saveGame.register(heyVR);
user.register(heyVR);
leaderboards.register(heyVR);
```

## Technical

### NPM Scripts

- `npm run clean:tsc` cleans all typescript build artifacts
- `npm run build --workspaces` => builds all
- `npm pack --workspaces` => creates all packages
- `npm publish --workspaces` --access public => publishes all packages
