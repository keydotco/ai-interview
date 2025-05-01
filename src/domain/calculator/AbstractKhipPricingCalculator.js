const { get } = require("lodash");
const {
    FEE_CHARGE_MODE,
    TAX_CHARGE_MODE,
} = require("./util");

class AbstractKhipPricingCalculator {
    constructor(payload) {
        if (this.constructor === AbstractKhipPricingCalculator) {
            throw new TypeError('Abstract class "AbstractKhipPricing" cannot be instantiated directly');
        }

        this.payload = payload;
    }

    /**
     * Compute the fees from the payload
     * 
     * @returns Array of fee objects with description, flatAmount, and percentageAmountOfBaseRate
     */
    getFees() {
        // guard clause - no pricing settings
        const { pricingType, pricingSettings } = this.payload;
        if (!pricingSettings) return [];

        // guard clause - no fees
        const feesObj = get(pricingSettings.find((setting) => setting.pricingModel === pricingType), 'fees');
        if (!feesObj) return [];

        return feesObj.reduce((fees, fee) => {
            const description = get(fee, 'name');
            const flatAmount = get(fee, 'amount', 0);
            const percentageAmountOfBaseRate = get(fee, 'percent', 0);
            const chargeMode = get(fee, 'chargeMode');

            const supportedChargeModes = [
                FEE_CHARGE_MODE.RENT,
                FEE_CHARGE_MODE.STAY,
            ];
            if (!description || description.toLowerCase() === 'security deposit' || !supportedChargeModes.includes(chargeMode)) return fees;

            return [...fees, {
                description,
                flatAmount: parseFloat(flatAmount.toFixed(2)),
                percentageAmountOfBaseRate: parseFloat(percentageAmountOfBaseRate.toFixed(2)),
            }];
        }, []);
    }

    /**
     * Compute the security deposit from the payload fees
     *    
     * @returns {Object} Object containing the securityDeposit and securityDepositPercentage
     */
    getSecurityDeposit() {
        // guard clause - no pricing settings
        const { pricingType, pricingSettings } = this.payload;
        if (!pricingSettings) return null;

        // guard clause - no fees
        const feesObj = get(pricingSettings.find((setting) => setting.pricingModel === pricingType), 'fees');
        if (!feesObj) return null;

        const securityDepositFee = feesObj.find((fee) => {
            const feeName = fee.name;
            if (!feeName) return false;
            return feeName.toLowerCase() === 'security deposit';
        });

        return {
            securityDeposit: parseFloat(get(securityDepositFee, 'amount', 0).toFixed(2)),
            securityDepositPercentage: parseFloat(get(securityDepositFee, 'percent', 0).toFixed(2)),
        };
    }

    /**
     * Compute the taxes from the payload
     * 
     * @returns {Object} Object containing the taxesAmount and taxesPercentage
     */
    getTaxes() {
        // guard clause - no pricing settings
        const { pricingType, pricingSettings } = this.payload;
        if (!pricingSettings) return [];

        // guard clause - no taxes
        const taxesObj = get(pricingSettings.find((setting) => setting.pricingModel === pricingType), 'taxes');
        if (!taxesObj) return [];

        const { taxesAmount, taxesPercentage } = taxesObj.reduce((taxes, tax) => {
            const description = get(tax, 'name');
            const flatAmount = get(tax, 'amount', 0);
            const percentageAmountOfBaseRate = get(tax, 'percent', 0);
            const chargeMode = get(tax, 'chargeMode');

            const supportedChargeModes = [
                TAX_CHARGE_MODE.RENT_AND_FEES,
                TAX_CHARGE_MODE.RENT,
                TAX_CHARGE_MODE.STAY,
            ];
            if (!description || !supportedChargeModes.includes(chargeMode)) return taxes;

            return {
                taxesAmount: taxes.taxesAmount + parseFloat(flatAmount),
                taxesPercentage: taxes.taxesPercentage + parseFloat(percentageAmountOfBaseRate),
            };
        }, { taxesAmount: 0, taxesPercentage: 0 });

        return {
            taxesAmount: parseFloat(taxesAmount.toFixed(2)),
            taxesPercentage: parseFloat(taxesPercentage.toFixed(2)),
        };
    }

    getBaseRates() {
        throw new Error('Method must be implemented by subclass');
    }
}

module.exports = AbstractKhipPricingCalculator;
