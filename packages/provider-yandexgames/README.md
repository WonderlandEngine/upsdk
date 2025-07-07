# Yandex Games Provider

This package provides integration with the Yandex Games platform for the Wonderland UpSDK. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-yandexgames
```

## Usage

```javascript
import { YandexGamesProvider } from '@wonderlandengine/upsdk-provider-yandexgames';

const provider = new YandexGamesProvider();

await provider.initialize();
await provider.showAd();
```

## Methods

- `initialize()`: Initializes the Yandex Games provider.
- `showAd()`: Displays an advertisement provided by Yandex Games.
- `isAdAvailable()`: Checks if an advertisement is available.

## License

MIT
