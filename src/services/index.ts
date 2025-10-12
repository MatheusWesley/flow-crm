// Service exports for easy importing
export { httpClient } from './httpClient';
export { productService } from './productService';
export { inventoryService } from './inventoryService';
export { authService } from './authService';
export { customerService } from './customerService';
export { presaleService } from './presaleService';
export { dashboardService } from './dashboardService';
export { paymentMethodService } from './paymentMethodService';
export { userService } from './userService';
export { reportsService } from './reportsService';
export * as permissionsService from './permissionsService';
export { ToastService } from './ToastService';

// Export types from inventory service
export type {
    StockAdjustmentRequest,
    StockAdjustment,
    StockHistoryFilters,
    InventoryError
} from './inventoryService';