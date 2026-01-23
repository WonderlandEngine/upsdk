import {PurchasesProvider} from '@wonderlandengine/upsdk';

export type DigitalGoodsProviderConfig = {
    billingService: string;
};

/**
 * Digital Goods Provider (Web Digital Goods API).
 *
 * Implements PurchasesProvider to query and purchase digital goods using the
 * platform's getDigitalGoodsService and Payment Request flow. Owned item IDs
 * are stored in-memory after listing purchases via the digital goods service.
 */
export class DigitalGoodsProvider implements PurchasesProvider {
    name = 'digital-goods';
    available = true;

    private _ownedItems: PurchaseDetails[] = [];
    private _config: DigitalGoodsProviderConfig;
    private _service: DigitalGoodsService;

    /**
     * Constructor
     */
    constructor(config: DigitalGoodsProviderConfig) {
        if (!('getDigitalGoodsService' in window)) {
            console.warn('Digital Goods Provider not available on this platform.');
            this.available = false;
            return;
        }
        this._config = config;

        window.getDigitalGoodsService(config.billingService).then(async (service) => {
            this._service = service;
            const purchases = await service.listPurchases();
            this._ownedItems = purchases;
        });
    }
    async getItemDetails(itemIds: string[]): Promise<DigitalGoodsProductDetails[]> {
        if (!('getDigitalGoodsService' in window)) {
            console.warn('Digital Goods Provider not available on this platform.');
            return [];
        }
        const details = await this._service.getDetails(itemIds);
        return details;
    }

    async purchaseItem(itemId: string, count: number = 1): Promise<boolean> {
        const paymentMethods = [
            {supportedMethods: this._config.billingService, data: {sku: itemId}},
        ];
        const request = new PaymentRequest(paymentMethods, {
            id: itemId,
            total: {label: 'Cool item', amount: {currency: 'USD', value: '123'}},
        });
        try {
            const response = await request.show();
            const purchaseToken = response.details.purchaseToken;
            console.log(`got purchase token: ${purchaseToken}`);
            return purchaseToken;
        } catch (e) {
            console.error('Payment Request failed or was cancelled.', e);
            return false;
        }
    }

    isItemPurchased(itemId: string): boolean {
        return this._ownedItems.some((item) => item.itemId === itemId);
    }
    async getItemURL(itemId: string): Promise<string> {
        // TODO meta store page?
        return '';
    }
}

export class DigitalGoodsProviderMock implements PurchasesProvider {
    private _purchasedItems: Set<string> = new Set();

    async purchaseItem(itemId: string, count?: number): Promise<boolean> {
        console.log('Mock purchaseItem for', itemId, 'count', count);
        this._purchasedItems.add(itemId);
        return true;
    }

    isItemPurchased(itemId: string): boolean {
        console.log('Mock isItemPurchased for', itemId);
        return this._purchasedItems.has(itemId);
    }

    async getItemURL(itemId: string): Promise<string> {
        console.log('Mock getItemURL for', itemId);
        return `https://store.example.com/item/${itemId}`;
    }

    async getItemDetails(itemIds: string[]): Promise<DigitalGoodsProductDetails[]> {
        console.log('Mock getItemDetails for', itemIds);
        return itemIds.map((id) => ({
            itemId: id,
            title: `Mock Item ${id}`,
            description: `Mock description for ${id}`,
            price: {currency: 'USD', value: '1.00'},
            iconURLs: [],
            subscriptionPeriod: '',
            freeTrialPeriod: '',
            introductoryPricePeriod: '',
            introductoryPriceCycles: 0,
            type: 'product',
            introductoryPrice: {currency: 'USD', value: '1.00'},
        }));
    }
    name = 'digital-goods';
    available = true;
}
