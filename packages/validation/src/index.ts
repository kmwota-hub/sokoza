import { z } from 'zod';

// Kenyan Phone Validation Regex (supports +254..., 254..., 07..., 01...)
const KENYA_PHONE_REGEX = /^(?:\+254|254|0)?(7(?:[0-9]{8})|1(?:[0-9]{8}))$/;

export const RegisterUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(KENYA_PHONE_REGEX, 'Invalid Kenyan phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CUSTOMER', 'BUSINESS_OWNER', 'RIDER']).optional().default('CUSTOMER'),
});

export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateBusinessSchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phone: z.string().regex(KENYA_PHONE_REGEX, 'Invalid Kenyan phone number'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is required'),
  area: z.string().min(2, 'Area is required (e.g. Juja Town, Gachororo)'),
  latitude: z.number(),
  longitude: z.number(),
  deliveryMode: z.enum(['OWN_RIDERS', 'PLATFORM_RIDERS', 'BOTH']).default('BOTH'),
});

export const CreateProductSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(5, 'Description is required'),
  price: z.number().positive('Price must be greater than 0'),
  discountPrice: z.number().positive().optional(),
  sku: z.string().min(2, 'SKU is required'),
  stockQuantity: z.number().int().nonnegative('Stock quantity must be 0 or greater'),
});

export const CreateAddressSchema = z.object({
  label: z.string().min(1, 'Label is required (e.g. Home, Office)'),
  addressLine: z.string().min(3, 'Address line is required'),
  area: z.string().min(2, 'Area is required (e.g. Highpoint, Juja)'),
  building: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  instructions: z.string().optional(),
  isDefault: z.boolean().optional().default(false),
});

export const AddToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const CreateFeatureRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(15, 'Please provide detailed description of the problem or solution'),
  category: z.enum([
    'BUSINESS',
    'DELIVERY',
    'PAYMENT',
    'CUSTOMER',
    'PRODUCT',
    'REPORTING',
    'COMMUNICATION',
    'OTHER',
  ]),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type CreateBusinessInput = z.infer<typeof CreateBusinessSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type CreateFeatureRequestInput = z.infer<typeof CreateFeatureRequestSchema>;
