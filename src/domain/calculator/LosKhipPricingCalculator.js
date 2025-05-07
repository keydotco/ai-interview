const moment = require('moment-timezone');
const AbstractKhipPricingCalculator = require('./AbstractKhipPricingCalculator');
const { enumerateDaysBetweenDates } = require('./util');

// Maximum length of stay to consider when calculating rates
// Based on 2024 data showing most bookings are under 7 days
const MAX_RELEVANT_LOS = 7;

class LosKhipPricingCalculator extends AbstractKhipPricingCalculator {
    _parseRecordPairsIntoMap(recordPairs) {
        const recordPairMap = {};
        let lastValidLos = 0;
        let lastValidRate = 0;
        let minLos = Infinity;

        // First pass to determine minimum LOS in the data
        for (let i = 0; i < recordPairs.length; i += 2) {
            const los = parseInt(recordPairs[i]);
            const rate = parseFloat(recordPairs[i + 1]);
            
            if (!isNaN(rate) && rate && !isNaN(los)) {
                minLos = Math.min(minLos, los);
            }
        }
        
        // If minimum LOS exceeds our MAX_RELEVANT_LOS, we should return empty
        if (minLos > MAX_RELEVANT_LOS) {
            return {};
        }

        // Original processing logic
        for (let i = 0; i < recordPairs.length; i += 2) {
            const los = parseInt(recordPairs[i]);
            const rate = parseFloat(recordPairs[i + 1]);

            // Add the current LOS rate if it's valid
            if (!isNaN(rate) && rate) {
                recordPairMap[los] = rate;

                // Fill in gaps between last valid LOS and current LOS
                for (let j = lastValidLos + 1; j < los; j++) {
                    if (!recordPairMap[j]) {
                        recordPairMap[j] = (lastValidRate / lastValidLos) * j;
                    }
                }

                // Update last valid LOS and rate
                lastValidLos = los;
                lastValidRate = rate;
            }
        }

        // Apply the MAX_RELEVANT_LOS limit
        const maxLos = Math.min(lastValidLos, MAX_RELEVANT_LOS);
        const limitedRecordPairMap = {};
        
        for (const [los, rate] of Object.entries(recordPairMap)) {
            if (parseInt(los) <= maxLos) {
                limitedRecordPairMap[los] = rate;
            }
        }

        return limitedRecordPairMap;
    }

    _addRates(mappedRates, losRateMap, startDate) {
        if (!Object.keys(losRateMap).length) {
            return mappedRates;
        }

        // Calculate average rate using only the filtered LOS data
        const totalLos = Object.keys(losRateMap).reduce((totalLos, los) => totalLos + parseInt(los), 0);
        const totalRate = Object.values(losRateMap).reduce((totalRate, rate) => totalRate + rate, 0);
        const averageRate = parseFloat((totalRate / totalLos).toFixed(2));

        const realStartDate = moment(startDate).add(Object.keys(losRateMap)[0] - 1, 'days').format('YYYY-MM-DD'); // sub 1 since LoS is technically 1-indexed
        const realEndDate = moment(startDate).add(Object.keys(losRateMap).pop(), 'days').format('YYYY-MM-DD');

        return [...mappedRates, {
            start: realStartDate,
            end: realEndDate,
            nightlyRate: averageRate,
            reliability: 'estimated',
        }];
    }

    /**
     * Compute the base rates from the payload's LoS records
     *
     * @returns Object array of base rates with start, end, nightlyRate, and reliability
     */
    getBaseRates() {
        // guard clause - no LoS records
        const { losRecords } = this.payload;
        if (!losRecords) {
            return [];
        }

        const nightlyRates = losRecords.reduce(
            (mappedRates, losRecord, idx) => {
                // get record pairs
                const [currentStartDate, _, ...losRecordPairs] = losRecord.split(',');

                // parse pairs into map
                const currentLosRateMap = this._parseRecordPairsIntoMap(losRecordPairs);
                const mappedDates = mappedRates
                    .map(rate => enumerateDaysBetweenDates(moment(rate.start), moment(rate.end), true))
                    .flat()
                    .map(date => date.format('YYYY-MM-DD'));

                // first losRecord or gap to last mapped rate, can map all dates
                const isFirstLosRecord = idx === 0;
                const mapAllRates = isFirstLosRecord || (mappedRates.length > 0 && moment(currentStartDate).isAfter(mappedRates[mappedRates.length - 1].end));
                if (mapAllRates) {
                    return this._addRates(mappedRates, currentLosRateMap, currentStartDate);
                };

                // remove dates from losRateMap that are already mapped
                Object.keys(currentLosRateMap).forEach(los => {
                    const date = moment(currentStartDate).add(los, 'days').format('YYYY-MM-DD');
                    if (mappedDates.includes(date)) {
                        delete currentLosRateMap[los];
                    }
                });

                // last losRecord, can map all remaining dates
                const isLastRecord = idx === losRecords.length - 1;
                if (isLastRecord) {
                    return this._addRates(mappedRates, currentLosRateMap, currentStartDate);
                }

                // remove dates from losRateMap that are in the next losRecord
                const [nextStartDate, _2, ...nextLosRecordPairs] = losRecords[idx + 1].split(',');
                const nextLosRateMap = this._parseRecordPairsIntoMap(nextLosRecordPairs);
                const nextMappedDates = Object.keys(nextLosRateMap).map(los => moment(nextStartDate).add(los, 'days').format('YYYY-MM-DD'));
                Object.keys(currentLosRateMap).forEach(los => {
                    const date = moment(currentStartDate).add(los, 'days').format('YYYY-MM-DD');
                    if (nextMappedDates.includes(date)) {
                        delete currentLosRateMap[los];
                    }
                });

                return this._addRates(mappedRates, currentLosRateMap, currentStartDate);
            }, [],
        );
        return nightlyRates;
    }
}

module.exports = LosKhipPricingCalculator;