import { AbstractGlobalProvider, Provider } from './provider.js';

export interface ExtraProvider extends Provider {
    celebrate(): void;
}

class Extra
    extends AbstractGlobalProvider<ExtraProvider>
    implements ExtraProvider
{
    name = 'uber-extra-provider';

    celebrate(): void {
        for (const p of this.providers) p.celebrate();
    }
}

export const extra = new Extra();
