# LocalStorage Provider

This package provides local storage integration for the Wonderland UpSDK. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-localstorage
```

## Usage

```javascript
import { LocalStorageProvider } from '@wonderlandengine/upsdk-provider-localstorage';

const saveProvider = new LocalStorageProvider({
    key: 'my-game-save'
});

// Save game data
saveProvider.save({ level: 5, score: 1000 });

// Load game data
const gameData = saveProvider.load();
```

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| `key` | `string` | The localStorage key for saving game data. |

## Methods

- `save(data)`: Saves game data to localStorage.
- `load(out?)`: Loads game data from localStorage.

## License

MIT
