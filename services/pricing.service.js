/**
 * Pricing Service for Herbalife Products (2026 Update)
 * Handles member price calculations, taxes (IVA + RE), and shipping rules.
 */

export class PricingService {
    /**
     * Tax Rates Configuration
     */
    static TAX_RATES = {
        internal: { iva: 0.10, re: 0.014 }, // Nutrition
        external: { iva: 0.21, re: 0.052 }, // SKIN / Cosmetics
        literature: { iva: 0.04, re: 0.005 } // Books / Flyers
    };

    /**
     * Shipping Rates Configuration (Online - Peninsula)
     */
    static SHIPPING = {
        THRESHOLD_PV: 100,
        FREE_COST: 0,
        STANDARD_COST: 4.25,
        IVA_RATE: 0.21
    };

    /**
     * Calculates the member price (Base Imponible)
     * @param {number} listPrice - Retail price
     * @param {number} earnBase - Base for discount calculation
     * @param {number} discountTier - 0.25, 0.35, 0.42, or 0.50
     * @returns {number} - Base Imponible
     */
    static calculateBaseImponible(listPrice, earnBase, discountTier) {
        // Formula: PL - (BD * %Desc)
        const discountAmount = earnBase * discountTier;
        return Math.max(0, listPrice - discountAmount);
    }

    /**
     * Calculates final price including IVA and optionally RE
     * @param {number} baseImponible - Price before taxes
     * @param {string} category - 'internal', 'external', or 'literature'
     * @param {boolean} includeRE - Whether to include Recargo de Equivalencia
     * @returns {number} - Total price
     */
    static calculateFinalPrice(baseImponible, category = 'internal', includeRE = true) {
        const rates = this.TAX_RATES[category] || this.TAX_RATES.internal;
        const totalTaxRate = rates.iva + (includeRE ? rates.re : 0);
        return baseImponible * (1 + totalTaxRate);
    }

    /**
     * Calculates shipping costs based on Volume Points
     * @param {number} totalPV - Total volume points of the order
     * @param {boolean} isOnline - Whether the order is online
     * @returns {object} - { cost: number, iva: number, total: number }
     */
    static calculateShipping(totalPV, isOnline = true) {
        if (!isOnline) return { cost: 6.00, iva: 6.00 * 0.21, total: 7.26 }; // Standard phone rate

        if (totalPV >= this.SHIPPING.THRESHOLD_PV) {
            return { cost: 0, iva: 0, total: 0 };
        }

        const cost = this.SHIPPING.STANDARD_COST;
        const iva = cost * this.SHIPPING.IVA_RATE;
        return {
            cost: cost,
            iva: iva,
            total: cost + iva
        };
    }
}

export const pricingService = new PricingService();
