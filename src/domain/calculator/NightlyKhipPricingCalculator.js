const moment = require('moment-timezone');
const AbstractKhipPricingCalculator = require('./AbstractKhipPricingCalculator');

class NightlyKhipPricingCalulator extends AbstractKhipPricingCalculator {
    /**
     * Compute the base rates from the payload's nightly pricing from the current
     * date until a future date (either two years from now or the final override
     * date, whichever is later). Consecutive days with the same rate will be
     * merged into a single pricing block.
     * 
     * Nightly pricing overrides will be applied to specific dates if they exist.
     *
     * @returns Object array of base rates with start, end, and nightlyRate
     */
    getBaseRates() {
        // guard clause - no nightly pricing
        const { nightlyPricing } = this.payload;
        if (!nightlyPricing) {
            return [];
        }

        return [];
    }
}

module.exports = NightlyKhipPricingCalulator;
