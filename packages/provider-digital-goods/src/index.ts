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
    private _details: DigitalGoodsProductDetails[] = [];

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

        window
            .getDigitalGoodsService(config.billingService)
            .then(async (service) => {
                this._service = service;
                try {
                    const purchases = await service.listPurchases();
                    this._ownedItems = purchases;

                    this.available = true;
                } catch (e) {
                    console.error('Failed to get previous purchases:', e);
                    this.available = false;
                }
            })
            .catch((e) => {
                console.error('Failed to get Digital Goods Service:', e);
                this.available = false;
            });
    }

    async getItemDetails(itemIds: string[]): Promise<DigitalGoodsProductDetails[]> {
        if (!itemIds || itemIds.length === 0) {
            return [];
        }

        if (!('getDigitalGoodsService' in window)) {
            console.warn('Digital Goods Provider not available on this platform.');
            return [];
        }

        if (!this._service) {
            console.warn('Digital Goods Service not initialized yet.');
            return [];
        }

        try {
            this._details = await this._service.getDetails(itemIds);
            return this._details;
        } catch (e) {
            console.error('Failed to get item details:', e);
            return [];
        }
    }

    async purchaseItem(itemId: string, count: number = 1): Promise<boolean> {
        if (!itemId) {
            console.error('Missing itemId for purchaseItem.');
            return false;
        }

        const paymentMethods = [
            {supportedMethods: this._config.billingService, data: {sku: itemId}},
        ];

        if (!this._service) {
            console.error('Digital Goods Service not initialized.');
            return false;
        }
        let details: DigitalGoodsProductDetails[];
        try {
            details = await this._service.getDetails([itemId]);
        } catch (e) {
            console.error('Failed to get item details for purchase:', e);
            return false;
        }
        // Checks
        if (!details || details.length === 0) {
            console.error(`Item details not found for itemId: ${itemId}`);
            return false;
        }

        const request = new PaymentRequest(paymentMethods, {
            id: itemId,
            total: {
                label: details[0].title,
                amount: {
                    currency: details[0].price.currency,
                    value: details[0].price.value,
                },
            },
        });
        try {
            const response = await request.show();
            const purchaseToken = response.details.purchaseToken;
            console.log(`got purchase token: ${purchaseToken}`);
        } catch (e) {
            console.error('Payment Request failed or was cancelled.', e);
            return false;
        }
        try {
            this._ownedItems = await this._service.listPurchases();
        } catch (e) {
            console.error('Failed to refresh owned items after purchase:', e);
            return false;
        }
        return true;
    }

    isItemPurchased(itemId: string): boolean {
        if (!itemId) {
            console.error('Missing itemId for isItemPurchased.');
            return false;
        }
        return this._ownedItems.some((item) => item.itemId === itemId);
    }

    getPurchasedItems(): PurchaseDetails[] {
        return [...this._ownedItems];
    }

    async getItemURL(itemId: string): Promise<string> {
        // TODO meta store page?
        return '';
    }
}

export type MockTestData = {
    id: string;
    title?: string;
    description?: string;
    price?: {currency: string; value: string};
    subscriptionPeriod?: string;
    freeTrialPeriod?: string;
    introductoryPricePeriod?: string;
    introductoryPriceCycles?: number;
    introductoryPrice?: {currency: string; value: string};
    throwError?: string;
    purchased?: boolean;
};

export class DigitalGoodsProviderMock implements PurchasesProvider {
    name = 'digital-goods-mock';
    available = true;

    private _purchasedItems: Set<string> = new Set();
    private _testData: MockTestData[] | null = null;

    constructor(testData: MockTestData[] = null) {
        if (testData != null) {
            this._testData = testData;
            for (const item of testData) {
                if (item.purchased) {
                    this._purchasedItems.add(item.id);
                }
            }
        }
    }

    async purchaseItem(itemId: string, count?: number): Promise<boolean> {
        if (this._testData != null) {
            const data = this._testData.find((item) => item.id === itemId);
            if (data && data.throwError) {
                throw new Error(data.throwError);
            }
        }
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
        if (this._testData == null) {
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
        } else {
            const result: DigitalGoodsProductDetails[] = [];
            for (const id of itemIds) {
                const data = this._testData.find((item) => item.id === id);
                if (data) {
                    result.push({
                        itemId: id,
                        title: data.title ?? `Mock Item ${id}`,
                        description: data.description ?? `Mock description for ${id}`,
                        price: data.price ?? {currency: 'USD', value: '1.00'},
                        iconURLs: [],
                        subscriptionPeriod: data.subscriptionPeriod ?? '',
                        freeTrialPeriod: data.freeTrialPeriod ?? '',
                        introductoryPricePeriod: data.introductoryPricePeriod ?? '',
                        introductoryPriceCycles: data.introductoryPriceCycles ?? 0,
                        type: 'product',
                        introductoryPrice: data.introductoryPrice ?? {
                            currency: 'USD',
                            value: '1.00',
                        },
                    });
                }
            }
            return result;
        }
    }
}
