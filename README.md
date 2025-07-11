<div align="center">
  <a href="https://github.com/WonderlandEngine/upsdk/#readme">
    <picture>
      <img alt="UPSDK logo" src="https://wonderlandengine.com/static/upsdk-logo_256.png" height="128">
    </picture>
  </a>
  <h1>UPSDK - Universal Platform SDK for Web Game Platform Services</h1>

<a href="https://wonderlandengine.com"><img alt="Wonderland Engine logo" src="https://img.shields.io/badge/MADE%20BY%20Wonderland%20Engine-2b2b2b.svg"></a>
<a href="https://www.npmjs.com/package/@wonderlandengine/upsdk"><img alt="NPM version" src="https://img.shields.io/npm/v/@wonderlandengine/upsdk.svg"></a>
<a href="https://github.com/WonderlandEngine/upsdk/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/@wonderlandengine/upsdk.svg"></a>

</div>

UPSDK radically speeds up your publishing process, because you can integrate it once
and publish your game to each new platform by adding 2 lines of code.

```ts
import {
    advertising,
    analytics
    extra,
    leaderboards,
    purchases,
    saveGame,
    user,
} from '@wonderlandengine/upsdk';

async function main() {
    analytics.trackGameplayStart();

    /* Get username/profile picture/avatar of logged in users */
    if(!user.isLoggedIn()) await user.requestLogin();
    console.log('Welcome,', user.user.name);

    /* Post scores and read from leaderboards */
    leaderboards.postScore('my-leaderboard', 9001);

    /* Use cloud saves (or fall back to cookie/local storage) */
    saveGame.save({level: 42, exp: 123013, nickname: 'Neo'})

    /* Show ads - rewarded or midroll! */
    document.queryElement('#watch-ad').addEventListener('click', e => {
        if(!advertising.hasAd()) return;

        advertising.showRewardedAd(e)
            .then(giveReward)
            .catch(handleAdError);
    });

    /* Make in-app purchases! */
    purchases.purchaseItem('dev-speed-potion', 100);

    analytics.trackGameplayStop();

    /* Use special platform features! */
    extra.celebrate();
}
```

## Providers

Providers implement the interfaces provided in this package for the individual platforms.

Find a list of all available providers below:

[i]: ## "Implemented."
[n]: ## "Not implemented."
[u]: ## "Used in production."

| **Platform**                                                                                | **Advertising** | **Analytics** | **Extra** | **Leaderboards** | **Purchases** | **SaveGame** | **User** |
| ------------------------------------------------------------------------------------------- | -------------- | -------------- | --------- | ---------------- | ------------- | ------------ | -------- |
| [HeyVR](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-heyvr)               | [✅][u]        |                |           | [✅][u]          | [✅][u]       | [✅][u]      | [✅][u]  |
| [CrazyGames](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-crazygames)     | [✅][u]        | [✅][u]        | [✅][u]   | N/A              | [❌][n]       | [✅][u]      | [✅][u]  |
| [Poki](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-poki)                 | [🟡][i]        | [🟡][i]        |           |                  |               |              |          |
| [Viverse](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-viverse)           | N/A            | N/A            | N/A       | N/A              | N/A           | N/A          | [✅][u]  |
| [AdInPlay](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-adinplay)         | [🟡][i]        | N/A            | N/A       | N/A              | N/A           | N/A          | N/A      |
| [Applixir](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-applixir)         | [🟡][i]        | N/A            | N/A       | N/A              | N/A           | N/A          | N/A      |
| [Yandex Games](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-yandexgames)  | [🟡][i]        | [❌][n]        | [❌][n]   |  [❌][n]         | [❌][n]       | [❌][n]      | [❌][n]  |
| [Telegram](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-telegram)         |                |                |           |                  |               |              | [🟡][i]  |
| [Cookie](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-cookie)             |                |                |           |                  |               | [✅][u]      |          |
| [LocalStorage](https://www.npmjs.com/package/@wonderlandengine/upsdk-provider-localstorage) |                |                |           |                  |               | [🟡][i]      |          |
| Discord Activities                                                                          |                |                |           |                  |               |              |          |

## How to Use

The SDK is designed to allow multiple platforms at the same time, choosing whichever is available
and providing fallbacks, e.g. save games with cookies or local storage, if no service is available.

Each service you want to support needs to be registered with "global providers".
These global providers can be used from anywhere in the code:

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
- `npm publish --workspaces --access public` => publishes all packages

# LICENSE

MIT, see LICENSE file.