/** Generic Provider interface */
export interface Provider {
    /** Name of this provider */
    name: string;

    /** Whether this provider is available, default `true` */
    available?: boolean;
}

/** Abstract class for global aggregating Providers */
export abstract class AbstractGlobalProvider<T extends Provider> implements Provider {
    abstract name: string;

    providers: T[] = [];
    /** Register a {@link Provider}. If {@link Provider.available} is `false`, registration is skipped. */
    registerProvider(p: T) {
        if (p.available ?? true) {
            this.providers.push(p);
        }
    }

    /** Whether there are registered **and** available providers */
    hasProviders() {
        return this.providers.length !== 0;
    }
}
