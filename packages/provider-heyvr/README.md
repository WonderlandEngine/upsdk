# HeyVR Provider

This package provides integration with the HeyVR platform for the Wonderland UpSDK. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-heyvr
```

## Usage

```javascript
import { HeyVRProvider } from '@wonderlandengine/upsdk-provider-heyvr';

const provider = new HeyVRProvider({
    appId: 'your-heyvr-app-id'
});

await provider.initialize();
await provider.showAd();
```

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| `appId` | `string` | Your HeyVR application identifier. |

## Methods

- `initialize()`: Initializes the HeyVR provider.
- `showAd()`: Displays an advertisement provided by HeyVR.
- `isAdAvailable()`: Checks if an advertisement is available.

## License

MIT
