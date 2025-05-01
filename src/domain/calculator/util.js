const FEE_CHARGE_MODE = {
    GUEST: 'per_guest',
    NIGHT_PER_GUEST: 'per_night_per_guest',
    NIGHTLY: 'per_night',
    RENT: 'of_rent',
    STAY: 'per_stay',
};

const PRICING_MODEL = {
    NIGHTLY: 'nightly_pricing',
    LOS: 'los_pricing',
};

const TAX_CHARGE_MODE = {
    GUEST_PER_NIGHT: 'per_guest_per_night',
    GUEST: 'per_guest',
    NIGHT: 'per_night',
    RENT_AND_FEES: 'of_rent_and_fees',
    RENT: 'of_rent',
    STAY: 'per_stay',
};

/**
 * Get all days between two dates
 * @param {moment.Moment} startDate
 * @param {moment.Moment} endDate
 * @returns array of moment dates
 */
const enumerateDaysBetweenDates = (startDate, endDate, includeFinalDay = false) => {
    const numDaysBetween = endDate.diff(startDate, 'days') + (includeFinalDay ? 2 : 1);
    return [...new Array(numDaysBetween)].map((_, idx) => startDate.clone().add(idx, 'days'));
};

module.exports = {
    FEE_CHARGE_MODE,
    PRICING_MODEL,
    TAX_CHARGE_MODE,
    enumerateDaysBetweenDates
};
