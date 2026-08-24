import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { DeliveryModule } from '../delivery/delivery.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DeliveryModule, NotificationsModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}