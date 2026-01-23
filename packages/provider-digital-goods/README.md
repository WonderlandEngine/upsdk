# Digital Goods Provider

This package provides integration for monetization with the Digital Goods API for the Wonderland UpSDK. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>.

## Supported Platforms

### Meta

Billing service URL: `https://quest.meta.com/billing`
More info: <https://developers.meta.com/horizon/documentation/web/ps-monetization-overview>

The digital goods API is only available when the app is running from an APK. In it runs from the browser, requesting the service will throw an error: `Uncaught OperationError: unsupported context`.

### Google

Billing service URL: `https://play.google.com/billing`
More info: <https://chromeos.dev/en/publish/pwa-play-billing>

### Microsoft

Billing service URL: `https://store.microsoft.com/billing`
More info: <https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/digital-goods-api>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-digital-goods
```

## Usage

```javascript
import { DigitalGoodsProvider } from '@wonderlandengine/upsdk-provider-digital-goods';

const digitalGoodsProvider = new DigitalGoodsProvider({billingService: 'https://quest.meta.com/billing'});

```

## Configuration

## Methods

## License

MIT
