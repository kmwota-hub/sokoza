import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: any = null;

  constructor(private prisma: PrismaService) {
    this.initializeFirebase();
  }

  private async initializeFirebase() {
    try {
      // Gracefully attempt to import firebase-admin dynamically
      // to avoid compile-time failure if the dependency isn't in package.json.
      const firebaseAdmin: any = await import('firebase-admin');
      
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      if (serviceAccountPath) {
        this.firebaseApp = firebaseAdmin.initializeApp({
          credential: firebaseAdmin.credential.cert(serviceAccountPath),
        });
        this.logger.log('Firebase Admin SDK initialized successfully');
      } else {
        this.logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH not provided. Push notifications will run in MOCK mode.');
      }
    } catch (e: any) {
      this.logger.warn(`firebase-admin package not loaded or config missing: ${e.message}. Using mock fallback.`);
    }
  }

  async registerToken(userId: string, token: string, platform: string) {
    return this.prisma.deviceToken.upsert({
      where: { token },
      update: { userId, platform, updatedAt: new Date() },
      create: { userId, token, platform },
    });
  }

  async create(userId: string, type: string, title: string, message: string, data?: any) {
    // 1. Persist in database for in-app notification feed
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, message, data },
    });

    // 2. Trigger push notification
    await this.sendPush(userId, title, message, data);

    return notification;
  }

  async sendPush(userId: string, title: string, body: string, data?: any) {
    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId },
    });

    if (tokens.length === 0) {
      this.logger.log(`No registered device tokens for User ${userId}. Push notification simulated in logs.`);
      return;
    }

    if (this.firebaseApp) {
      try {
        const firebaseAdmin: any = await import('firebase-admin');
        const tokenStrings = tokens.map((t) => t.token);

        const response = await firebaseAdmin.messaging().sendEachForMulticast({
          tokens: tokenStrings,
          notification: { title, body },
          data: data ? this.serializeData(data) : undefined,
        });

        this.logger.log(`Firebase push sent: ${response.successCount} succeeded, ${response.failureCount} failed.`);
      } catch (error: any) {
        this.logger.error(`Error sending push notification via Firebase: ${error.message}`);
      }
    } else {
      // Mock push output
      this.logger.log(`[MOCK PUSH] Sent to User ${userId} (${tokens.length} devices): "${title}" - "${body}"`);
    }
  }

  async sendOrderUpdate(orderId: string, status: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      this.logger.warn(`Order ${orderId} not found. Cannot send update.`);
      return;
    }

    let title = 'Order Update';
    let message = `Your order status has changed to ${status}`;

    switch (status) {
      case 'CONFIRMED':
        title = 'Order Confirmed! 🎉';
        message = `Thank you for your order! Store is preparing it.`;
        break;
      case 'PREPARING':
        title = 'Preparing Order 🍳';
        message = `Your order is currently being prepared by the merchant.`;
        break;
      case 'READY_FOR_PICKUP':
        title = 'Ready for Pickup 📦';
        message = `Your order is ready! A rider is on the way to pick it up.`;
        break;
      case 'PICKED_UP':
        title = 'Order En Route 🚴';
        message = `Your rider has picked up your order and is heading your way.`;
        break;
      case 'DELIVERED':
        title = 'Order Delivered! 🍕';
        message = `Enjoy your meal/items! Please take a moment to rate the service.`;
        break;
      case 'CANCELLED':
        title = 'Order Cancelled ❌';
        message = `Your order has been cancelled. Please contact support if this was unexpected.`;
        break;
    }

    await this.create(order.customerId, 'ORDER_STATUS', title, message, { orderId, status });
  }

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  }

  private serializeData(data: any): Record<string, string> {
    const serialized: Record<string, string> = {};
    for (const key of Object.keys(data)) {
      if (typeof data[key] === 'object') {
        serialized[key] = JSON.stringify(data[key]);
      } else {
        serialized[key] = String(data[key]);
      }
    }
    return serialized;
  }
}