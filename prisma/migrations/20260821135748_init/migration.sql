-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RoleName" AS ENUM ('CUSTOMER', 'BUSINESS_OWNER', 'BUSINESS_STAFF', 'RIDER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('OWN_RIDERS', 'PLATFORM_RIDERS', 'BOTH');

-- CreateEnum
CREATE TYPE "BusinessMemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RiderType" AS ENUM ('PLATFORM', 'BUSINESS', 'BOTH');

-- CreateEnum
CREATE TYPE "RiderAvailabilityStatus" AS ENUM ('ONLINE', 'OFFLINE', 'BUSY', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RiderVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RiderDocumentType" AS ENUM ('NATIONAL_ID', 'DRIVING_LICENCE', 'VEHICLE_DOCUMENT', 'INSURANCE');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('BUSINESS_RIDER', 'PLATFORM_RIDER', 'CUSTOMER_PICKUP');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SEARCHING_RIDER', 'RIDER_ASSIGNED', 'RIDER_ACCEPTED', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_AT_DESTINATION', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MPESA', 'CARD', 'CASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('BUSINESS', 'DELIVERY', 'PAYMENT', 'CUSTOMER', 'PRODUCT', 'REPORTING', 'COMMUNICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "FeatureRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'PLANNED', 'IN_DEVELOPMENT', 'COMPLETED', 'DECLINED');

-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('PRODUCT_MISSING', 'WRONG_PRODUCT', 'DAMAGED_PRODUCT', 'LATE_DELIVERY', 'PAYMENT_PROBLEM', 'RIDER_ISSUE', 'BUSINESS_ISSUE');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profileImage" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" "RoleName" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "businessName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "businessStatus" "BusinessStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryMode" "DeliveryMode" NOT NULL DEFAULT 'BOTH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessMember" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "BusinessMemberRole" NOT NULL DEFAULT 'STAFF',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "parentId" UUID,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "discountPrice" DECIMAL(12,2),
    "sku" TEXT NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "building" TEXT,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "instructions" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "deliveryFee" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "orderStatus" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryAddressId" UUID NOT NULL,
    "customerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rider" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "riderType" "RiderType" NOT NULL DEFAULT 'PLATFORM',
    "vehicleType" TEXT NOT NULL,
    "vehicleRegistration" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "verificationStatus" "RiderVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "availabilityStatus" "RiderAvailabilityStatus" NOT NULL DEFAULT 'OFFLINE',
    "currentLatitude" DECIMAL(10,8),
    "currentLongitude" DECIMAL(11,8),
    "deliveryRadius" DECIMAL(5,2) NOT NULL DEFAULT 15.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderDocument" (
    "id" UUID NOT NULL,
    "riderId" UUID NOT NULL,
    "documentType" "RiderDocumentType" NOT NULL,
    "documentNumber" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "verificationStatus" "RiderVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedById" UUID,
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "RiderDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiderAvailability" (
    "id" UUID NOT NULL,
    "riderId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RiderAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessRider" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "riderId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessRider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "deliveryType" "DeliveryType" NOT NULL DEFAULT 'PLATFORM_RIDER',
    "riderId" UUID,
    "pickupAddress" TEXT NOT NULL,
    "pickupLatitude" DECIMAL(10,8) NOT NULL,
    "pickupLongitude" DECIMAL(11,8) NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLatitude" DECIMAL(10,8) NOT NULL,
    "deliveryLongitude" DECIMAL(11,8) NOT NULL,
    "deliveryFee" DECIMAL(12,2) NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryRequest" (
    "id" UUID NOT NULL,
    "deliveryId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "riderId" UUID NOT NULL,
    "distance" DECIMAL(8,2) NOT NULL,
    "offeredFee" DECIMAL(12,2) NOT NULL,
    "status" "DeliveryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'MPESA',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "transactionReference" TEXT NOT NULL,
    "providerReference" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "rawResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "riderId" UUID,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "deliveryId" UUID NOT NULL,
    "platformFee" DECIMAL(12,2) NOT NULL,
    "businessCommission" DECIMAL(12,2) NOT NULL,
    "riderCommission" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" UUID NOT NULL,
    "riderId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'MPESA',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "createdBy" UUID NOT NULL,
    "reason" "DisputeReason" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolvedBy" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "status" "FeatureRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "adminResponse" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureRequestVote" (
    "id" UUID NOT NULL,
    "featureRequestId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeatureRequestVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Business_slug_key" ON "Business"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessMember_businessId_userId_key" ON "BusinessMember"("businessId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_businessId_sku_key" ON "Product"("businessId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_productId_key" ON "Inventory"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_businessId_key" ON "Cart"("userId", "businessId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Rider_userId_key" ON "Rider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessRider_businessId_riderId_key" ON "BusinessRider"("businessId", "riderId");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_transactionReference_key" ON "PaymentTransaction"("transactionReference");

-- CreateIndex
CREATE UNIQUE INDEX "Review_customerId_orderId_key" ON "Review"("customerId", "orderId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureRequestVote_featureRequestId_userId_key" ON "FeatureRequestVote"("featureRequestId", "userId");

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessMember" ADD CONSTRAINT "BusinessMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rider" ADD CONSTRAINT "Rider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderDocument" ADD CONSTRAINT "RiderDocument_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderDocument" ADD CONSTRAINT "RiderDocument_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiderAvailability" ADD CONSTRAINT "RiderAvailability_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRider" ADD CONSTRAINT "BusinessRider_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessRider" ADD CONSTRAINT "BusinessRider_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRequest" ADD CONSTRAINT "DeliveryRequest_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRequest" ADD CONSTRAINT "DeliveryRequest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryRequest" ADD CONSTRAINT "DeliveryRequest_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "Delivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequest" ADD CONSTRAINT "FeatureRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequestVote" ADD CONSTRAINT "FeatureRequestVote_featureRequestId_fkey" FOREIGN KEY ("featureRequestId") REFERENCES "FeatureRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureRequestVote" ADD CONSTRAINT "FeatureRequestVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
