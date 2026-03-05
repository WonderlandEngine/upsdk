import {PurchasedItem, PurchasesProvider} from '@wonderlandengine/upsdk';

/**
 * Configuration for the Digital Goods Provider.
 */
export type DigitalGoodsProviderConfig = {
    /** Platform-specific billing service identifier (e.g., 'https://quest.meta.com/billing') */
    billingService: string;
};

/**
 * Digital Goods Provider using the Web Digital Goods API.
 *
 * Enables in-app purchases through platform-native billing services.
 * Queries product details, processes purchases via Payment Request API,
 * and tracks owned items in-memory.
 *
 * @example
 * ```ts
 * const provider = new DigitalGoodsProvider({
 *   billingService: 'https://quest.meta.com/billing'
 * });
 * ```
 */
export class DigitalGoodsProvider implements PurchasesProvider {
    name = 'digital-goods';
    available = true;

    private _ownedItems: PurchaseDetails[] = [];
    private _config: DigitalGoodsProviderConfig;
    private _service: DigitalGoodsService;
    private _details: DigitalGoodsProductDetails[] = [];

    /**
     * Initialize the Digital Goods Provider.
     *
     * @param config - Provider configuration with billing service identifier
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

    /**
     * Retrieve product details for specified item IDs.
     *
     * @param itemIds - Array of product identifiers to query
     * @returns Product details including price, title, and description
     */
    async getItemDetails<DigitalGoodsProductDetails>(
        itemIds: string[]
    ): Promise<DigitalGoodsProductDetails[]> {
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
            return this._details as DigitalGoodsProductDetails[];
        } catch (e) {
            throw new Error('Failed to get item details: ' + e);
        }
    }

    /**
     * Initiate purchase flow for a digital item.
     *
     * Opens Payment Request dialog and processes the transaction.
     * Updates owned items list on successful purchase.
     *
     * @param itemId - Product identifier to purchase
     * @param count - Quantity (currently only 1 is supported)
     * @returns True if purchase succeeded, false otherwise
     */
    async purchaseItem(itemId: string, count: number = 1): Promise<boolean> {
        if (!itemId) {
            throw new Error('Missing itemId for purchaseItem.');
        }

        const paymentMethods = [
            {supportedMethods: this._config.billingService, data: {sku: itemId}},
        ];

        if (!this._service) {
            throw new Error('Digital Goods Service not initialized.');
        }
        let details: DigitalGoodsProductDetails[];
        try {
            details = await this._service.getDetails([itemId]);
        } catch (e) {
            throw new Error('Failed to get item details for purchase: ' + e);
        }
        // Checks
        if (!details || details.length === 0) {
            throw new Error(`Item details not found for itemId: ${itemId}`);
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
            await request.show();
        } catch (e) {
            throw new Error('Payment request failed or was cancelled: ' + e);
        }
        try {
            this._ownedItems = await this._service.listPurchases();
        } catch (e) {
            throw new Error('Failed to refresh owned items after purchase: ' + e);
        }
        return true;
    }

    /**
     * Check if a product has been purchased.
     *
     * @param itemId - Product identifier to check
     * @returns True if the user owns the item
     */
    isItemPurchased(itemId: string): boolean {
        if (!itemId) {
            throw new Error('Missing itemId for isItemPurchased.');
        }
        return this._ownedItems.some((item) => item.itemId === itemId);
    }

    /**
     * Get all purchased items.
     *
     * @returns Array of purchase details for all owned items
     */
    async getPurchasedItems(): Promise<PurchasedItem[]> {
        const purchases = await this._service.listPurchaseHistory();
        this._ownedItems = purchases;
        return purchases.map((p) => ({id: p.itemId, token: p.purchaseToken}));
    }

    /**
     * Get store page URL for an item.
     *
     * @param itemId - Product identifier
     * @returns Store URL (currently not implemented)
     */
    async getItemURL(itemId: string): Promise<string> {
        // TODO meta store page?
        return '';
    }
}

/**
 * Test data configuration for mock provider.
 */
export type MockTestData = {
    /** Product identifier */
    id: string;
    /** Product display name */
    title?: string;
    /** Product description text */
    description?: string;
    /** Price information with currency and value */
    price?: {currency: string; value: string};
    /** Subscription duration period */
    subscriptionPeriod?: string;
    /** Free trial duration period */
    freeTrialPeriod?: string;
    /** Introductory price duration period */
    introductoryPricePeriod?: string;
    /** Number of introductory price cycles */
    introductoryPriceCycles?: number;
    /** Introductory price information */
    introductoryPrice?: {currency: string; value: string};
    /** Error message to throw during operations (testing) */
    throwError?: string;
    /** Initial purchase state */
    purchased?: boolean;
};

/**
 * Mock implementation of Digital Goods Provider for testing.
 *
 * Simulates purchase operations without actual transactions.
 * Accepts test data to configure product details and behavior.
 *
 * @example
 * ```ts
 * const mock = new DigitalGoodsProviderMock([
 *   { id: 'item1', title: 'Test Item', price: { currency: 'USD', value: '9.99' } }
 * ]);
 * ```
 */
export class DigitalGoodsProviderMock implements PurchasesProvider {
    name = 'digital-goods-mock';
    available = true;

    private _purchasedItems: Set<string> = new Set();
    private _testData: MockTestData[] | null = null;

    /**
     * Initialize the mock provider.
     *
     * @param testData - Optional array of product configurations for testing
     */
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

    /**
     * Simulate a purchase operation.
     *
     * @param itemId - Product identifier to purchase
     * @param count - Quantity (optional)
     * @returns True on success
     * @throws Error if test data specifies throwError
     */
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

    /**
     * Check if an item is marked as purchased.
     *
     * @param itemId - Product identifier to check
     * @returns True if purchased
     */
    isItemPurchased(itemId: string): boolean {
        console.log('Mock isItemPurchased for', itemId);
        return this._purchasedItems.has(itemId);
    }

    /**
     * Get mock store URL.
     *
     * @param itemId - Product identifier
     * @returns Mock store URL
     */
    async getItemURL(itemId: string): Promise<string> {
        console.log('Mock getItemURL for', itemId);
        return `https://store.example.com/item/${itemId}`;
    }

    /**
     * Retrieve mock product details.
     *
     * @param itemIds - Array of product identifiers
     * @returns Mock product details based on test data or default values
     */
    async getItemDetails<DigitalGoodsProductDetails>(
        itemIds: string[]
    ): Promise<DigitalGoodsProductDetails[]> {
        console.log('Mock getItemDetails for', itemIds);
        if (this._testData == null) {
            return itemIds.map(
                (id) =>
                    ({
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
                    }) as DigitalGoodsProductDetails
            );
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
                    } as DigitalGoodsProductDetails);
                }
            }
            return result as DigitalGoodsProductDetails[];
        }
    }

    /**
     * Get all purchased items.
     *
     * @returns Array of purchase details for all owned items
     */
    async getPurchasedItems(): Promise<PurchasedItem[]> {
        return Array.from(this._purchasedItems).map((id) => ({
            id,
            token: `mock-token-${id}`,
        }));
    }
}
