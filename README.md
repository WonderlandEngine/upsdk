# Abstraction SDK for Web Games Platform Services

## Platforms

[i]: ## Implemented.
[n]: ## Not implemented.
[u]: ## Used in production.

| **Platform**       | **Avertising** | **Analytics** | **Extra** | **Leaderboards** | **Purchases** | **SaveGame** | **User** |
| ------------------ | -------------- | ------------- | --------- | ---------------- | ------------- | ------------ | -------- |
| HeyVR              | [✅][u]        |               |           | [✅][u]          | [✅][u]       | [✅][u]      | [✅][u]  |
| CrazyGames         | [🟡][i]        | [🟡][i]       | [🟡][i]   | N/A              | [❌][n]       | [🟡][i]      | [🟡][i]  |
| AdInPlay           | [🟡][i]        | N/A           | N/A       | N/A              | N/A           | N/A          | N/A      |
| Applixir           | [🟡][i]        | N/A           | N/A       | N/A              | N/A           | N/A          | N/A      |
| Yandex Games       | [🟡][i]        | [❌][n]       | [❌][n]   |  [❌][n]         | [❌][n]       | [❌][n]      | [❌][n]  |
| Telegram           |                |               |           |                  |               |              | [🟡][i]  |
| Discord Activities |                |               |           |                  |               |              |          |
| Cookie             |                |               |           |                  |               | [✅][u]      |          |
| LocalStorage       |                |               |           |                  |               | [🟡][i]      |          |

## How to Use

The SDK is designed to allow multiple platforms at the same time, choosing whichever is avilable
and allowing to provide fallbacks, e.g. to cookies, if no logged-in service is available.

The services you want to support need to be registered to "global providers". These global
providers can be used from anywhere in the code:

```ts
import {saveGame} from '@wonderlandengine/uber-sdk';

saveGame.save({level: 42});
```

### Register Proviers

To register a provider, run this code as early as possible:

```ts
import {saveGame, user, leaderboards} from '@wonderlandengine/uber-sdk';
import {HeyVRProvider} from '@wonderlandengine/uber-sdk/providers';
import {CookieSaveGameProvider} from '@wonderlandengine/uber-sdk/providers';

/* Registering a provider is simple */
saveGame.register(new CookieSaveGameProvider());

/* Many providers support multiple services, register them to the ones you use: */
const heyVR = new HeyVRProvider();
saveGame.register(HeyVR);
user.register(HeyVR);
leaderboards.register(HeyVR);
```
