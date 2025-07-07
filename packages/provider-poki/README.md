# Poki Provider

This package provides integration with the Poki gaming platform for the Wonderland UpSDK. The provider supports advertising and analytics functionality. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-poki
```

## Usage

```javascript
import { PokiProvider } from '@wonderlandengine/upsdk-provider-poki';

const provider = new PokiProvider();

// Wait for initialization
await provider.onReady;

// Show ads
await provider.showRewardedAd(userGesture);
await provider.showMidgameAd(userGesture);

// Analytics
provider.trackGameplayStart();
provider.trackGameplayStop();
provider.trackLoadingStop();
```

## Features

- **Advertising**: Rewarded and commercial break ads
- **Analytics**: Gameplay and loading tracking

## Methods

### Advertising

- `hasAd()`: Checks if ads are available
- `showRewardedAd(userGesture)`: Shows a rewarded ad
- `showMidgameAd(userGesture)`: Shows a commercial break ad

### Analytics

- `trackGameplayStart()`: Track when gameplay starts
- `trackGameplayStop()`: Track when gameplay stops
- `trackLoadingStart()`: Track when loading starts (no-op)
- `trackLoadingStop()`: Track when loading stops

## Properties

- `onReady`: Promise that resolves when the Poki SDK is initialized
- `ready`: Boolean indicating if the provider is ready

## License

MIT
