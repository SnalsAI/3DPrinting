// Type definitions for the 3D Printing Platform

import { User, Model3D, Customization, Order, OrderItem, PrintPartner, PrintJob, Role, OrderStatus, PrintStatus, MaterialType } from '@prisma/client';

// Re-export Prisma types
export type {
  User,
  Model3D,
  Customization,
  Order,
  OrderItem,
  PrintPartner,
  PrintJob,
  Role,
  OrderStatus,
  PrintStatus,
  MaterialType,
};

// Extended types with relations
export type Model3DWithCreator = Model3D & {
  createdBy: User;
};

export type CustomizationWithRelations = Customization & {
  model: Model3D;
  user: User;
};

export type OrderWithItems = Order & {
  items: (OrderItem & {
    customization: CustomizationWithRelations;
  })[];
  user: User;
};

export type OrderItemWithRelations = OrderItem & {
  customization: CustomizationWithRelations;
  order: Order;
};

export type PrintJobWithRelations = PrintJob & {
  orderItem: OrderItemWithRelations;
  partner: PrintPartner | null;
};

// Form types
export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  email: string;
  phone: string;
}

export interface CartItem {
  customizationId: string;
  quantity: number;
}

export interface CustomizationInput {
  modelId: string;
  userId: string;
  parameters: {
    color: string;
    text?: string;
    logoUrl?: string;
    material: MaterialType;
    dimensions?: {
      x: number;
      y: number;
      z: number;
    };
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// NextAuth types extension
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}
