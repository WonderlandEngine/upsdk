# Abstraction SDK for Web Games Platform Services

## Platforms

| **Platform** | **Avertising**           | **Analytics** | **Extra** | **Leaderboards** | **Purchases** | **SaveGame** | **User** |
|--------------|--------------------------|---------------|-----------|------------------|---------------|--------------|----------|
| HeyVR        |[✅](Used in production.) |               |           |[✅](Used in production.) |[✅](Used in production.) |[✅](Used in production.) | [✅](Used in production.) |
| CrazyGames   |[🟡](Implemented.)|[🟡](Implemented.)|[🟡](Implemented.)|N/A|[❌](Not implemented.)|[🟡](Implemented.)|[🟡](Implemented.)|
| AdInPlay     |[🟡](Implemented.)|N/A|N/A|N/A|N/A|N/A|N/A|
| Applixir     |[🟡](Implemented.)|N/A|N/A|N/A|N/A|N/A|N/A|
| Telegram     |                          |               |           |                  |               |              |[🟡](Implemented.)|
| Discord Activities |                          |               |           |                  |               |              | |

## How to Use

The SDK is designed to allow multiple platforms at the same time, choosing whichever is avilable
and allowing to provide fallbacks, e.g. to cookies, if no logged-in service is available.

The services you want to support need to be registered to "global providers". These global
providers can be used from anywhere in the code:

```ts
import {saveGame} from '@wonderlandengine/uber-sdk'

saveGame.save({level: 42});
```

### Register Proviers

To register a provider, run this code as early as possible:

```ts
import {saveGame, user, leaderboards} from '@wonderlandengine/uber-sdk'
import {HeyVRProvider} from '@wonderlandengine/uber-sdk/providers'
import {CookieSaveGameProvider} from '@wonderlandengine/uber-sdk/providers'

/* Registering a provider is simple */
saveGame.register(new CookieSaveGameProvider);

/* Many providers support multiple services, register them to the ones you use: */
const heyVR = new HeyVRProvider();
saveGame.register(HeyVR);
user.register(HeyVR);
leaderboards.register(HeyVR);
```
