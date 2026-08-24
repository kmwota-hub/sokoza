// System Enums & Types for SOKOZA Platform

export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export type SystemRole =
  | 'CUSTOMER'
  | 'BUSINESS_OWNER'
  | 'BUSINESS_STAFF'
  | 'RIDER'
  | 'ADMIN';

export type BusinessStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';

export type DeliveryMode = 'OWN_RIDERS' | 'PLATFORM_RIDERS' | 'BOTH';

export type BusinessMemberRole = 'OWNER' | 'MANAGER' | 'STAFF';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED';

export type RiderType = 'PLATFORM' | 'BUSINESS' | 'BOTH';

export type RiderAvailabilityStatus =
  | 'ONLINE'
  | 'OFFLINE'
  | 'BUSY'
  | 'SUSPENDED';

export type RiderVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type RiderDocumentType =
  | 'NATIONAL_ID'
  | 'DRIVING_LICENCE'
  | 'VEHICLE_DOCUMENT'
  | 'INSURANCE';

export type DeliveryType =
  | 'BUSINESS_RIDER'
  | 'PLATFORM_RIDER'
  | 'CUSTOMER_PICKUP';

export type DeliveryStatus =
  | 'PENDING'
  | 'SEARCHING_RIDER'
  | 'RIDER_ASSIGNED'
  | 'RIDER_ACCEPTED'
  | 'ARRIVED_AT_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_DESTINATION'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export type DeliveryRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CANCELLED';

export type PaymentMethod = 'MPESA' | 'CARD' | 'CASH';

export type PaymentStatus =
  | 'PENDING'
  | 'SUCCESS' | 'FAILED'
  | 'CANCELLED'
  | 'REFUNDED';

export type FeatureCategory =
  | 'BUSINESS'
  | 'DELIVERY'
  | 'PAYMENT'
  | 'CUSTOMER'
  | 'PRODUCT'
  | 'REPORTING'
  | 'COMMUNICATION'
  | 'OTHER';

export type FeatureRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PLANNED'
  | 'IN_DEVELOPMENT'
  | 'COMPLETED'
  | 'DECLINED';

export type DisputeReason =
  | 'PRODUCT_MISSING'
  | 'WRONG_PRODUCT'
  | 'DAMAGED_PRODUCT'
  | 'LATE_DELIVERY'
  | 'PAYMENT_PROBLEM'
  | 'RIDER_ISSUE'
  | 'BUSINESS_ISSUE';

export type DisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

// Core Entity Interfaces
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string | null;
  status: UserStatus;
  roles: SystemRole[];
  createdAt: string;
  updatedAt: string;
}

export interface IBusiness {
  id: string;
  ownerId: string;
  businessName: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  logo?: string | null;
  coverImage?: string | null;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  businessStatus: BusinessStatus;
  deliveryMode: DeliveryMode;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  status: string;
}

export interface IProduct {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  sku: string;
  status: ProductStatus;
  images: string[];
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  businessId: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryAddressId: string;
  customerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IDelivery {
  id: string;
  orderId: string;
  deliveryType: DeliveryType;
  riderId?: string | null;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  deliveryFee: number;
  status: DeliveryStatus;
  requestedAt?: string | null;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IFeatureRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: FeatureCategory;
  status: FeatureRequestStatus;
  adminResponse?: string | null;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
