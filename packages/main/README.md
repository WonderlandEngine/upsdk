# Universal Platform (UP) SDK for Web Game Platform Services

Integrate UPSDK once and publish your game to any platform.


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

Find a list of all available providers [on the GitHub repository](https://github.com/WonderlandEngine/upsdk/#providers).

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
