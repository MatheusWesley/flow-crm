// Price calculation service for automatic sale price suggestions

export interface PriceCalculationConfig {
  defaultMarginPercentage: number;
  minMargin: number;
  maxMargin: number;
}

class PriceCalculationService {
  private static config: PriceCalculationConfig = {
    defaultMarginPercentage: 0.3, // 30% default margin
    minMargin: 0.05, // 5% minimum margin
    maxMargin: 5.0, // 500% maximum margin
  };

  /**
   * Calculate suggested sale price based on purchase price
   */
  static calculateSuggestedPrice(purchasePrice: number, marginPercentage?: number): number {
    if (purchasePrice <= 0) return 0;

    const margin = marginPercentage ?? this.config.defaultMarginPercentage;
    const clampedMargin = Math.max(this.config.minMargin, Math.min(this.config.maxMargin, margin));
    
    return Math.round((purchasePrice * (1 + clampedMargin)) * 100) / 100;
  }

  /**
   * Calculate margin percentage between purchase and sale price
   */
  static calculateMarginPercentage(purchasePrice: number, salePrice: number): number {
    if (purchasePrice <= 0) return 0;
    return (salePrice - purchasePrice) / purchasePrice;
  }

  /**
   * Format price to Brazilian real format
   */
  static formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }

  /**
   * Parse price string to number (removes currency symbols and handles comma/dot)
   */
  static parsePrice(priceString: string): number {
    if (!priceString) return 0;
    
    // Remove currency symbols and spaces
    const cleanString = priceString.replace(/[R$\s]/g, '');
    
    // Handle Brazilian format (comma as decimal separator)
    const normalized = cleanString.replace(',', '.');
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Update configuration
   */
  static updateConfig(newConfig: Partial<PriceCalculationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  static getConfig(): PriceCalculationConfig {
    return { ...this.config };
  }
}

export default PriceCalculationService;