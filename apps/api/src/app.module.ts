import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BusinessesModule } from './businesses/businesses.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { RidersModule } from './riders/riders.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DeliveryModule } from './delivery/delivery.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    BusinessesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    RidersModule,
    NotificationsModule,
    DeliveryModule,
    PaymentsModule,
    ReviewsModule,
    AdminModule,
  ],
})
export class AppModule {}