import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [DeliveryService],
  controllers: [DeliveryController],
  exports: [DeliveryService],
})
export class DeliveryModule {}