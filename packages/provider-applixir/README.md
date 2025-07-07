# Applixir Provider

This package provides integration with the Applixir advertising platform for the Wonderland UpSDK. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-applixir
```

## Usage

```javascript
import { ApplixirProvider } from '@wonderlandengine/upsdk-provider-applixir';

const adProvider = new ApplixirProvider({
    gameId: 'your-applixir-game-id',
    userId: 'your-user-id'
});

await adProvider.initialize();
await adProvider.showAd();
```

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| `gameId` | `string` | Your Applixir game identifier. |
| `userId` | `string` | Your user identifier. |

## Methods

- `initialize()`: Initializes the Applixir provider.
- `showAd()`: Displays an advertisement provided by Applixir.
- `isAdAvailable()`: Checks if an advertisement is available.

## License

MIT
