# CrazyGames Provider

This package provides integration with the CrazyGames platform for the Wonderland UpSDK. The provider supports advertising, analytics, user management, and save game functionality. The provider requires the core api at <https://www.npmjs.com/package/@wonderlandengine/upsdk>

## Installation

```bash
npm install @wonderlandengine/upsdk-provider-crazygames
```

## Usage

```javascript
import { CrazyGamesProvider } from '@wonderlandengine/upsdk-provider-crazygames';

const provider = new CrazyGamesProvider();

// Wait for initialization
await provider.onReady;

// Show ads
await provider.showRewardedAd(userGesture);
await provider.showMidgameAd(userGesture);

// Analytics
provider.trackGameplayStart();
provider.trackGameplayStop();

// User management
const user = await provider.requestLogin();

// Save game
provider.save({ level: 5, score: 1000 });
const gameData = provider.load();

// Celebrate
provider.celebrate();
```

## Features

- **Advertising**: Rewarded and midgame ads
- **Analytics**: Gameplay and loading tracking
- **User Management**: Authentication and user profiles
- **Save Games**: Cloud-based save game storage
- **Extra**: Celebration effects

## Methods

### Advertising

- `hasAd()`: Checks if ads are available
- `showRewardedAd(userGesture)`: Shows a rewarded ad
- `showMidgameAd(userGesture)`: Shows a midgame ad

### Analytics

- `trackGameplayStart()`: Track when gameplay starts
- `trackGameplayStop()`: Track when gameplay stops
- `trackLoadingStart()`: Track when loading starts
- `trackLoadingStop()`: Track when loading stops

### User Management

- `requestLogin()`: Prompt user to login
- `isLoggedIn`: Check if user is logged in

### Save Games

- `save(data)`: Save game data
- `load(out?)`: Load game data

### Extra

- `celebrate()`: Trigger celebration effect

## License

MIT
