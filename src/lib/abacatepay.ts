// AbacatePay API v1 Integration - PIX Only
// Integração simples e direta para pagamentos PIX

// Types
export interface BillingCustomer {
  name: string;
  email: string;
  cellphone?: string;
  taxId?: string;
}

export interface BillingProduct {
  externalId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface BillingResponseProduct {
  id: string;
  externalId: string;
  quantity: number;
}

export type BillingStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | string;

export interface BillingResponse {
  id: string;
  url: string;
  status: BillingStatus;
  devMode: boolean;
  methods: string[];
  products: BillingResponseProduct[];
  frequency: string;
  amount: number;
  nextBilling?: string | null;
  customer: {
    id: string;
    metadata: {
      name: string;
      cellphone?: string;
      email: string;
      taxId?: string;
    };
  };
  allowCoupons: boolean;
  coupons: string[];
}

export interface CreateBillingRequest {
  frequency: 'ONE_TIME' | 'MULTIPLE_PAYMENTS';
  methods: ('PIX' | 'CARD')[];
  products: BillingProduct[];
  returnUrl: string;
  completionUrl: string;
  customer?: BillingCustomer;
  customerId?: string;
  allowCoupons?: boolean;
  coupons?: string[];
  externalId?: string;
  metadata?: Record<string, string>; // Mudança: apenas strings
}

export interface ApiResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
  } | null;
}

// Webhook Types
export interface AbacatePayWebhookPayload<T = unknown> {
  event: string;
  devMode: boolean;
  data: T;
}

export interface BillingWebhookData {
  id: string;
  externalId?: string;
  amount: number;
  paidAmount?: number;
  status: BillingStatus;
  customer: {
    id: string;
    metadata: {
      name: string;
      cellphone?: string;
      email: string;
      taxId?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// AbacatePay Client
export class AbacatePayClient {
  private readonly baseUrl = 'https://api.abacatepay.com/v1';
  private readonly token: string;

  constructor(token: string) {
    if (!token) {
      throw new Error('AbacatePay token is required');
    }
    this.token = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    let result: ApiResponse<T>;

    try {
      result = await response.json();
    } catch {
      throw new Error(`AbacatePay returned invalid JSON (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(
        result?.error?.message || `AbacatePay request failed with status ${response.status}`
      );
    }

    if (result.error) {
      throw new Error(`AbacatePay Error: ${result.error.message}`);
    }

    if (!result.data) {
      throw new Error('Invalid response from AbacatePay API');
    }

    return result.data;
  }

  async createBilling(params: {
    products: BillingProduct[];
    returnUrl: string;
    completionUrl: string;
    customer?: BillingCustomer;
    customerId?: string;
    metadata?: Record<string, string>; // Mudança: apenas strings
    externalId?: string;
  }): Promise<BillingResponse> {
    // Validações básicas
    if (!params.products || params.products.length === 0) {
      throw new Error('At least one product is required');
    }

    if (!params.returnUrl || !params.completionUrl) {
      throw new Error('returnUrl and completionUrl are required');
    }

    // Se customer for fornecido, validar campos obrigatórios
    if (params.customer) {
      if (!params.customer.name || !params.customer.email) {
        throw new Error('Customer name and email are required');
      }
    }

    const payload: CreateBillingRequest = {
      frequency: 'ONE_TIME',
      methods: ['PIX'],
      products: params.products,
      returnUrl: params.returnUrl,
      completionUrl: params.completionUrl,
      customer: params.customer,
      customerId: params.customerId,
      metadata: params.metadata,
      externalId: params.externalId,
    };

    return this.request<BillingResponse>('/billing/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

// Factory function
export function getAbacatePayClient(): AbacatePayClient {
  const token = process.env.ABACATEPAY_TOKEN;
  
  if (!token) {
    throw new Error('ABACATEPAY_TOKEN environment variable is required');
  }

  return new AbacatePayClient(token);
}

// Webhook helper
export function parseWebhookEvent(rawBody: string): AbacatePayWebhookPayload<BillingWebhookData> {
  try {
    const payload = JSON.parse(rawBody) as AbacatePayWebhookPayload<BillingWebhookData>;
    
    if (!payload.event || !payload.data) {
      throw new Error('Invalid webhook payload structure');
    }

    if (typeof payload.devMode !== 'boolean') {
      throw new Error('Invalid devMode field in webhook payload');
    }

    return payload;
  } catch (error) {
    throw new Error(`Failed to parse webhook payload: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}