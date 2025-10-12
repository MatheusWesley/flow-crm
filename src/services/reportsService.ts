import type {
    PaymentMethodReportData,
    ReportFilters,
    ReportSummary,
} from '../types';
import { httpClient } from './httpClient';

/**
 * Service for handling reports API calls
 */
class ReportsService {
    private readonly baseUrl = '/api/reports';

    /**
     * Get payment methods report data
     */
    async getPaymentMethodsReport(
        filters?: ReportFilters,
    ): Promise<PaymentMethodReportData[]> {
        const params = new URLSearchParams();

        if (filters?.dateRange) {
            params.append('startDate', filters.dateRange.startDate.toISOString());
            params.append('endDate', filters.dateRange.endDate.toISOString());
        }

        if (filters?.paymentMethodId) {
            params.append('paymentMethodId', filters.paymentMethodId);
        }

        const queryString = params.toString();
        const url = `${this.baseUrl}/payment-methods${queryString ? `?${queryString}` : ''}`;

        const response = await httpClient.get<PaymentMethodReportData[]>(url);
        return response;
    }

    /**
     * Get report summary data
     */
    async getReportSummary(filters?: ReportFilters): Promise<ReportSummary> {
        const params = new URLSearchParams();

        if (filters?.dateRange) {
            params.append('startDate', filters.dateRange.startDate.toISOString());
            params.append('endDate', filters.dateRange.endDate.toISOString());
        }

        if (filters?.paymentMethodId) {
            params.append('paymentMethodId', filters.paymentMethodId);
        }

        const queryString = params.toString();
        const url = `${this.baseUrl}/summary${queryString ? `?${queryString}` : ''}`;

        const response = await httpClient.get<ReportSummary>(url);
        return response;
    }
}

// Export singleton instance
export const reportsService = new ReportsService();