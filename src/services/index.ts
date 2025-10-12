// Service exports for easy importing
export { default as httpClient } from './httpClient';
export { default as productService } from './productService';
export { default as inventoryService } from './inventoryService';
export { authService } from './authService';
export { default as customerService } from './customerService';
export { presaleService } from './presaleService';
export { dashboardService } from './dashboardService';
export { default as paymentMethodService } from './paymentMethodService';
export { default as userService } from './userService';
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