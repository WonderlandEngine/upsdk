# Telegram Provider

This package provides integration with the Telegram platform for the Wonderland UpSDK. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-telegram
```

## Usage

```javascript
import { TelegramProvider } from '@wonderlandengine/upsdk-provider-telegram';

const provider = new TelegramProvider({
    botToken: 'your-telegram-bot-token'
});

await provider.initialize();
await provider.showAd();
```

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| `botToken` | `string` | Your Telegram bot token. |

## Methods

- `initialize()`: Initializes the Telegram provider.
- `showAd()`: Displays an advertisement through Telegram.
- `isAdAvailable()`: Checks if an advertisement is available.

## License

MIT
