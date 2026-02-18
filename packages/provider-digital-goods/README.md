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

```typescript
import { DigitalGoodsProvider } from '@wonderlandengine/upsdk-provider-digital-goods';

const digitalGoodsProvider = new DigitalGoodsProvider({billingService: 'https://quest.meta.com/billing'});

```

## Configuration

The `DigitalGoodsProvider` accepts a configuration object with the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `billingService` | `string` | Yes | Platform-specific billing service URL (see Supported Platforms above) |

Example:

```javascript
const config = {
    billingService: 'https://quest.meta.com/billing'
};
```

## Methods

### `getItemDetails(itemIds: string[])`

Retrieve product details for specified item IDs.

**Parameters:**

- `itemIds` - Array of product identifiers to query

**Returns:** `Promise<DigitalGoodsProductDetails[]>` - Product details including price, title, and description

**Example:**

```typescript
const details = await provider.getItemDetails<DigitalGoodsProductDetails>(['item1', 'item2']);
console.log(details[0].title, details[0].price);
```

### `purchaseItem(itemId: string, count?: number)`

Initiate the purchase flow for a digital item. Opens the Payment Request dialog and processes the transaction.

**Parameters:**

- `itemId` - Product identifier to purchase
- `count` - Quantity (optional, currently only 1 is supported)

**Returns:** `Promise<boolean>` - True if purchase succeeded, false otherwise

**Example:**

```typescript
const success = await provider.purchaseItem('item1');
if (success) {
    console.log('Purchase successful!');
}
```

### `isItemPurchased(itemId: string)`

Check if a product has been purchased by the user.

**Parameters:**

- `itemId` - Product identifier to check

**Returns:** `boolean` - True if the user owns the item

**Example:**

```typescript
if (provider.isItemPurchased('premium_upgrade')) {
    // Grant access to premium features
}
```

### `getPurchasedItems()`

Get all purchased items for the current user.

**Returns:** `PurchaseDetails[]` - Array of purchase details for all owned items

**Example:**

```typescript
const purchases = provider.getPurchasedItems();
purchases.forEach(item => console.log(item.itemId));
```

### `getItemURL(itemId: string)`

Get the store page URL for an item (if available).

**Parameters:**

- `itemId` - Product identifier

**Returns:** `Promise<string>` - Store URL (currently not implemented, returns empty string)

**Example:**

```typescript
const url = await provider.getItemURL('item1');
```

## Testing

The package also includes `DigitalGoodsProviderMock` for testing without actual billing integration. Test goods can be defined as purchased or use an error to throw during purchase.

```typescript
import { DigitalGoodsProviderMock } from '@wonderlandengine/upsdk-provider-digital-goods';

const mockProvider = new DigitalGoodsProviderMock([
    { 
        id: 'item1', 
        title: 'Test Item', 
        price: { currency: 'USD', value: '9.99' },
        purchased: false
    },
     {
        id: 'item2',
        title: 'Test Item2',
        price: { currency: 'USD', value: '1.99' },
        throwError: "Simulated purchase error"
    }
]);
```

## License

MIT
