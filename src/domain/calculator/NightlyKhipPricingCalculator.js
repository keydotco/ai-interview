const moment = require('moment-timezone');
const AbstractKhipPricingCalculator = require('./AbstractKhipPricingCalculator');
const { enumerateDaysBetweenDates } = require('./util');

class NightlyKhipPricingCalulator extends AbstractKhipPricingCalculator {
    /**
     * Return the final date to calculate pricing for
     *
     * @returns Date - The final date to calculate pricing for
     */
    _getFinalDateToCalculate() {
        // get either two years from now or the final override date, whichever is later
        const finalOverrideDate = this._getFinalOverrideDate();
        const twoYearsFromNow = moment().add(2, 'years');

        // guard clause - if no override dates, return two years from now
        if (!finalOverrideDate) return twoYearsFromNow;

        // return the later of the two dates
        return finalOverrideDate > twoYearsFromNow ? finalOverrideDate : twoYearsFromNow;
    }

    /**
     * Return the final nightly override date
     *
     * @returns Date - The final nightly override date or null if there are no override dates
     */
    _getFinalOverrideDate() {
        const { nightlyPricing } = this.payload;
        const { nightlyPricingOverrides } = nightlyPricing;
        const nightlyOverrides = nightlyPricingOverrides.map((nightlyOverride) => nightlyOverride.dateRange);
        const finalOverrideDate = nightlyOverrides.reduce((finalDate, dateRange) => {
            const { until } = dateRange;
            const untilDate = moment.utc(until);
            if (!finalDate || untilDate > finalDate) {
                return untilDate;
            }
            return finalDate;
        }, null);

        return finalOverrideDate;
    };

    /**
     * Compute the base rates from the payload's nightly pricing
     *
     * @returns Object array of base rates with start, end, nightlyRate, and reliability
     */
    getBaseRates() {
        // guard clause - no nightly pricing
        const { nightlyPricing } = this.payload;
        if (!nightlyPricing) {
            return [];
        }

        const finalDateToCalculate = this._getFinalDateToCalculate();
        const dates = enumerateDaysBetweenDates(moment(), moment(finalDateToCalculate), true).map((date) => date.format('YYYY-MM-DD'));

        // for each date, now until final date, calculate the base rate in a reduce
        const { defaultNightlyPricing, nightlyPricingOverrides } = nightlyPricing;

        const nightlyOverridePricingRanges = nightlyPricingOverrides.map((nightlyOverridePricing) => {
            const { dateRange } = nightlyOverridePricing;
            const { from, until } = dateRange;
            const fromDate = moment(from);
            const untilDate = moment(until);
            return { fromDate, untilDate, nightlyOverridePricing };
        });

        return dates.reduce((baseRates, date) => {
            const dateMoment = moment(date);
            const { nightlyOverridePricing } = nightlyOverridePricingRanges.find(({fromDate, untilDate}) => {
                return fromDate < dateMoment && dateMoment < untilDate;
            }) || {};
            const pricingToUse = nightlyOverridePricing || defaultNightlyPricing;

            const { nightlyPrice, dayOfWeekPrices } = pricingToUse;
            const dayOfWeek = dateMoment.format('ddd').toLowerCase();
            const dayOfWeekPrice = dayOfWeekPrices && dayOfWeekPrices[dayOfWeek];
            const nightlyRate = nightlyPrice || dayOfWeekPrice[dayOfWeek]; // nightly price overrides day of week pricing

            const baseRate = {
                start: date,
                end: date,
                nightlyRate,
            };

            baseRates.push(baseRate);
            return baseRates;
        }, []).reduce((baseRates, baseRate) => {
            const { nightlyRate } = baseRate;
            const lastBaseRate = baseRates[baseRates.length - 1];

            // guard clause - first base rate, is no 'previous' base rate
            if (!lastBaseRate) return [baseRate];

            // guard clause - if the nightly rate is the same as the last nightly rate, extend the last base rate
            const { nightlyRate: lastNightlyRate } = lastBaseRate;
            if (nightlyRate === lastNightlyRate) {
                lastBaseRate.end = baseRate.end;
                return baseRates;
            }

            // otherwise, add the new base rate
            baseRates.push(baseRate);
            return baseRates;
        }, []);
    }
}

module.exports = NightlyKhipPricingCalulator;
