export interface ImportPOItemDto {
  quantity: number;
  unit?: string;
  description?: string;
  manufacturerModel?: string;
  partNumber?: string;
  traceabilityRequired: number;
  unitPrice: number;
  totalPrice: number;
  actualCostPerUnit: number;
}

export interface ImportPurchaseOrderDto {
  poNumber: string;
  customerName: string;
  supplier?: string;
  destination?: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  shippingCharges?: number;
  discount?: number;
  orderDate: string; // keep as string (from Excel)
  modeOfShipment?: string;
  deliverySchedule?: string;
  totalAmount: number;
  totalCost: number;
  description?: string;
  createdBy?: number;
  items: ImportPOItemDto[];
}
