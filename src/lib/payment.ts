// ============================================
// MyFatoorah Payment Integration
// ============================================

const MYFATOORAH_API_URL = import.meta.env.VITE_MYFATOORAH_API_URL || 'https://apitest.myfatoorah.com';
const MYFATOORAH_API_KEY = import.meta.env.VITE_MYFATOORAH_API_KEY || '';

export interface PaymentMethod {
  PaymentMethodId: number;
  PaymentMethodAr: string;
  PaymentMethodEn: string;
  PaymentMethodCode: string;
  IsDirectPayment: boolean;
  ServiceCharge: number;
  TotalAmount: number;
  CurrencyIso: string;
  ImageUrl: string;
}

export interface InitiatePaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: any;
  Data: {
    PaymentMethods: PaymentMethod[];
  };
}

export interface ExecutePaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: any;
  Data: {
    InvoiceId: number;
    IsDirectPayment: boolean;
    PaymentURL: string;
    CustomerReference: string;
    RecurringId: string;
  };
}

export interface PaymentStatusResponse {
  IsSuccess: boolean;
  Message: string;
  Data: {
    InvoiceId: number;
    InvoiceStatus: string;
    InvoiceReference: string;
    CustomerReference: string;
    CreatedDate: string;
    ExpiryDate: string;
    InvoiceValue: number;
    Comments: string;
    CustomerName: string;
    CustomerMobile: string;
    CustomerEmail: string;
    TransactionStatus: string;
    PaymentMethod: string;
    InvoiceDisplayValue: string;
  };
}

// جلب طرق الدفع المتاحة
export async function getPaymentMethods(amount: number, currencyIso: string = 'KWD'): Promise<PaymentMethod[]> {
  try {
    const response = await fetch(`${MYFATOORAH_API_URL}/v2/InitiatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
      },
      body: JSON.stringify({
        InvoiceAmount: amount,
        CurrencyIso: currencyIso,
      }),
    });

    const data: InitiatePaymentResponse = await response.json();
    
    if (data.IsSuccess) {
      return data.Data.PaymentMethods;
    }
    
    console.error('Failed to get payment methods:', data.Message);
    return [];
  } catch (error) {
    console.error('Error getting payment methods:', error);
    return [];
  }
}

// تنفيذ الدفع
export async function executePayment(params: {
  paymentMethodId: number;
  customerName: string;
  customerEmail?: string;
  customerMobile: string;
  invoiceValue: number;
  displayCurrencyIso?: string;
  callbackUrl: string;
  errorUrl: string;
  language?: string;
  customerReference?: string;
  customerAddress?: {
    address: string;
    city: string;
  };
  invoiceItems?: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
}): Promise<ExecutePaymentResponse | null> {
  try {
    const response = await fetch(`${MYFATOORAH_API_URL}/v2/ExecutePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
      },
      body: JSON.stringify({
        PaymentMethodId: params.paymentMethodId,
        CustomerName: params.customerName,
        CustomerEmail: params.customerEmail || '',
        CustomerMobile: params.customerMobile,
        InvoiceValue: params.invoiceValue,
        DisplayCurrencyIso: params.displayCurrencyIso || 'KWD',
        CallBackUrl: params.callbackUrl,
        ErrorUrl: params.errorUrl,
        Language: params.language || 'ar',
        CustomerReference: params.customerReference || '',
        CustomerAddress: params.customerAddress ? {
          Address: params.customerAddress.address,
          AddressInstructions: '',
        } : undefined,
        InvoiceItems: params.invoiceItems,
      }),
    });

    const data: ExecutePaymentResponse = await response.json();
    
    if (data.IsSuccess) {
      return data;
    }
    
    console.error('Failed to execute payment:', data.Message, data.ValidationErrors);
    return null;
  } catch (error) {
    console.error('Error executing payment:', error);
    return null;
  }
}

// التحقق من حالة الدفع
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse | null> {
  try {
    const response = await fetch(`${MYFATOORAH_API_URL}/v2/GetPaymentStatus`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MYFATOORAH_API_KEY}`,
      },
      body: JSON.stringify({
        Key: paymentId,
        KeyType: 'PaymentId',
      }),
    });

    const data: PaymentStatusResponse = await response.json();
    
    if (data.IsSuccess) {
      return data;
    }
    
    console.error('Failed to get payment status:', data.Message);
    return null;
  } catch (error) {
    console.error('Error getting payment status:', error);
    return null;
  }
}

// أكواد طرق الدفع الشائعة في الكويت
export const PAYMENT_METHOD_IDS = {
  KNET: 1,
  VISA_MASTER: 2,
  APPLE_PAY: 11,
  GOOGLE_PAY: 20,
  SAMSUNG_PAY: 21,
};

// الحصول على أيقونة طريقة الدفع
export function getPaymentMethodIcon(code: string): string {
  const icons: Record<string, string> = {
    'KNET': '/icons/knet.svg',
    'VISA/MASTER': '/icons/visa-master.svg',
    'APPLE': '/icons/apple-pay.svg',
    'GOOGLE': '/icons/google-pay.svg',
  };
  return icons[code] || '/icons/payment.svg';
}
