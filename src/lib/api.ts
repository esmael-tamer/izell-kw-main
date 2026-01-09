/**
 * IZELL KW Backend API Client
 * Handles all communication with the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// =====================================================
// Types
// =====================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface StoreSettings {
  store_name: string;
  store_name_ar: string;
  tagline: string | null;
}

export interface Product {
  id: string;
  name: string;
  name_ar: string;
  description: string | null;
  price?: number;
  image?: string;
  category?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CouponValidationResult {
  valid: boolean;
  reason?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount?: number;
  finalSubtotal?: number;
  minOrderAmount?: number;
}

export interface CreateOrderResult {
  orderNumber: string;
  trackingToken: string;
  status: string;
}

export interface TrackOrderResult {
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'canceled';
  updatedAt: string;
}

// =====================================================
// API Client Class
// =====================================================

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
          message: data.message,
          details: data.details,
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error',
        message: 'Could not connect to server',
      };
    }
  }

  // =====================================================
  // Health Check
  // =====================================================
  
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request('/health');
  }

  // =====================================================
  // Store Settings
  // =====================================================
  
  async getStoreSettings(): Promise<ApiResponse<StoreSettings>> {
    return this.request('/store-settings');
  }

  // =====================================================
  // Products
  // =====================================================
  
  async getProducts(params?: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    category?: string;
  }): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    const endpoint = query ? `/products?${query}` : '/products';
    
    const response = await this.request<Product[]>(endpoint);
    
    return response as PaginatedResponse<Product>;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`);
  }

  // =====================================================
  // Coupons
  // =====================================================
  
  async validateCoupon(
    code: string,
    cartSubtotal: number
  ): Promise<ApiResponse<CouponValidationResult>> {
    return this.request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartSubtotal }),
    });
  }

  // =====================================================
  // Orders
  // =====================================================
  
  async createOrder(orderData: {
    customerName: string;
    customerEmail?: string;
    couponCode?: string;
    cartSubtotal?: number;
  }): Promise<ApiResponse<CreateOrderResult>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async trackOrder(
    orderNumber: string,
    token: string
  ): Promise<ApiResponse<TrackOrderResult>> {
    const params = new URLSearchParams({
      orderNumber,
      token,
    });
    
    return this.request(`/orders/track?${params.toString()}`);
  }
}

// =====================================================
// Export Singleton Instance
// =====================================================

export const api = new ApiClient(API_BASE_URL);

// =====================================================
// Status Mapping Helpers
// =====================================================

export const ORDER_STATUS_MAP = {
  pending: { ar: 'قيد التجهيز', en: 'Pending' },
  confirmed: { ar: 'تم التأكيد', en: 'Confirmed' },
  processing: { ar: 'قيد المعالجة', en: 'Processing' },
  shipped: { ar: 'تم الشحن', en: 'Shipped' },
  delivered: { ar: 'تم التسليم', en: 'Delivered' },
  canceled: { ar: 'تم الإلغاء', en: 'Canceled' },
} as const;

export function getStatusLabel(
  status: keyof typeof ORDER_STATUS_MAP,
  language: 'ar' | 'en' = 'ar'
): string {
  return ORDER_STATUS_MAP[status]?.[language] || status;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-amber-600 bg-amber-50';
    case 'confirmed':
      return 'text-blue-600 bg-blue-50';
    case 'processing':
      return 'text-purple-600 bg-purple-50';
    case 'shipped':
      return 'text-indigo-600 bg-indigo-50';
    case 'delivered':
      return 'text-green-600 bg-green-50';
    case 'canceled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}
