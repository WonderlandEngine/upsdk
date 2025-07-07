# AdinPlay Provider

This package provides integration with the AdinPlay advertising platform for the Wonderland UpSDK. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-adinplay
```

## Usage

```javascript
import { AdinPlayProvider } from '@wonderlandengine/upsdk-provider-adinplay';

const adProvider = new AdinPlayProvider({
    appId: 'your-adinplay-app-id',
    apiKey: 'your-adinplay-api-key'
});

await adProvider.initialize();
await adProvider.showAd();
```

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| `appId` | `string` | Your AdinPlay application identifier. |
| `apiKey` | `string` | Your AdinPlay API key. |

## Methods

- `initialize()`: Initializes the AdinPlay provider.
- `showAd()`: Displays an advertisement provided by AdinPlay.
- `isAdAvailable()`: Checks if an advertisement is available.

## License

MIT
