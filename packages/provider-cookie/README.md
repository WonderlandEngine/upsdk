# Cookie Provider

This package provides cookie-based storage integration for the Wonderland UpSDK. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-cookie
```

## Usage

```javascript
import { CookieProvider } from '@wonderlandengine/upsdk-provider-cookie';

const saveProvider = new CookieProvider({
    prefix: 'my-game-',
    expires: 30 // days
});

// Save game data
saveProvider.save({ level: 5, score: 1000 });

// Load game data
const gameData = saveProvider.load();
```

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| `prefix` | `string` | Prefix for cookie names to avoid conflicts. |
| `expires` | `number` | Number of days until cookies expire. |

## Methods

- `save(data)`: Saves game data to cookies.
- `load(out?)`: Loads game data from cookies.

## License

MIT
