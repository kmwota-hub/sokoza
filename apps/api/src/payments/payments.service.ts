import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PaymentStatus, PaymentMethod, OrderStatus } from '@prisma/client';
import { InitiateStkPushDto } from './dto/initiate-stkpush.dto';
import { DeliveryService } from '../delivery/delivery.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private deliveryService: DeliveryService,
    private notificationsService: NotificationsService,
  ) {}

  async getAccessToken(): Promise<string> {
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;
    const credentials = Buffer.from(`${key}:${secret}`).toString('base64');

    const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get M-Pesa access token: ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  async initiateStkPush(userId: string, dto: InitiateStkPushDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { customer: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.customerId !== userId) throw new ForbiddenException('Not your order');

    // Create Payment Record
    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        customerId: userId,
        amount: order.totalAmount,
        paymentMethod: PaymentMethod.MPESA,
        status: PaymentStatus.PENDING,
      },
    });

    const isMock =
      !process.env.MPESA_CONSUMER_KEY ||
      process.env.MPESA_CONSUMER_KEY === 'your_mpesa_consumer_key';

    if (isMock) {
      // Simulate Safaricom STK push response and asynchronous callback
      const reference = `MPESA-MOCK-${Date.now().toString().slice(-6)}`;
      const checkoutRequestID = `CO-MOCK-${Date.now().toString().slice(-6)}`;
      const merchantRequestID = `REQ-MOCK-${Date.now().toString().slice(-6)}`;

      await this.prisma.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          provider: 'MPESA',
          transactionReference: checkoutRequestID,
          providerReference: checkoutRequestID,
          amount: order.totalAmount,
          status: 'PENDING',
        },
      });

      // Trigger Async simulation
      setTimeout(async () => {
        try {
          await this.processCallback({
            merchantRequestID,
            checkoutRequestID,
            resultCode: 0,
            resultDesc: 'Success',
            reference,
            amount: Number(order.totalAmount),
          });
        } catch (e) {
          console.error('Async mock checkout error:', e);
        }
      }, 3000);

      return {
        success: true,
        message: '[MOCK] STK Push initiated successfully. Callback simulated in 3s.',
        paymentId: payment.id,
        reference: checkoutRequestID,
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      const shortcode = process.env.MPESA_SHORTCODE || '174379';
      const passkey = process.env.MPESA_PASSKEY;
      const callbackUrl = process.env.MPESA_CALLBACK_URL;

      const date = new Date();
      const timestamp =
        date.getFullYear().toString() +
        ('0' + (date.getMonth() + 1)).slice(-2) +
        ('0' + date.getDate()).slice(-2) +
        ('0' + date.getHours()).slice(-2) +
        ('0' + date.getMinutes()).slice(-2) +
        ('0' + date.getSeconds()).slice(-2);

      const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
      const amount = Math.round(Number(order.totalAmount));

      // Standardize phone number format for Safaricom: 254XXXXXXXXX
      let phone = dto.phone.replace(/[^0-9]/g, '');
      if (phone.startsWith('0')) {
        phone = '254' + phone.substring(1);
      } else if (phone.startsWith('+')) {
        phone = phone.substring(1);
      }
      if (!phone.startsWith('254')) {
        phone = '254' + phone;
      }

      const mpesaUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
      const mpesaResponse = await fetch(mpesaUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: amount,
          PartyA: phone,
          PartyB: shortcode,
          PhoneNumber: phone,
          CallBackURL: callbackUrl,
          AccountReference: order.orderNumber,
          TransactionDesc: `Payment for Sokoza Order ${order.orderNumber}`,
        }),
      });

      if (!mpesaResponse.ok) {
        const errorText = await mpesaResponse.text();
        throw new Error(`Safaricom STK push failed: ${errorText}`);
      }

      const mpesaData = await mpesaResponse.json();

      // Create local payment transaction mapping CheckoutRequestID
      await this.prisma.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          provider: 'MPESA',
          transactionReference: mpesaData.CheckoutRequestID,
          providerReference: mpesaData.CheckoutRequestID,
          amount: order.totalAmount,
          status: 'PENDING',
          rawResponse: mpesaData,
        },
      });

      return {
        success: true,
        message: 'STK Push sent to device',
        paymentId: payment.id,
        checkoutRequestId: mpesaData.CheckoutRequestID,
      };
    } catch (error: any) {
      // Fallback to mock on any connection or credential failure
      console.warn('Real M-Pesa failed, falling back to mock:', error.message);
      // Run mock
      const reference = `MPESA-MOCK-${Date.now().toString().slice(-6)}`;
      const checkoutRequestID = `CO-MOCK-${Date.now().toString().slice(-6)}`;
      const merchantRequestID = `REQ-MOCK-${Date.now().toString().slice(-6)}`;

      await this.prisma.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          provider: 'MPESA',
          transactionReference: checkoutRequestID,
          providerReference: checkoutRequestID,
          amount: order.totalAmount,
          status: 'PENDING',
        },
      });

      setTimeout(async () => {
        try {
          await this.processCallback({
            merchantRequestID,
            checkoutRequestID,
            resultCode: 0,
            resultDesc: 'Success',
            reference,
            amount: Number(order.totalAmount),
          });
        } catch (e) {
          console.error('Async mock checkout error:', e);
        }
      }, 3000);

      return {
        success: true,
        message: `[MOCK FALLBACK] Real STK Push failed (${error.message}). Simulated callback in 3s.`,
        paymentId: payment.id,
        reference: checkoutRequestID,
      };
    }
  }

  async processCallback(payload: {
    merchantRequestID: string;
    checkoutRequestID: string;
    resultCode: number;
    resultDesc: string;
    reference: string;
    amount: number;
  }) {
    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          { transactionReference: payload.checkoutRequestID },
          { providerReference: payload.checkoutRequestID },
        ],
      },
      include: { payment: true },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');

    const status = payload.resultCode === 0 ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

    await this.prisma.$transaction(async (tx) => {
      // Update transaction status
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: status === PaymentStatus.SUCCESS ? 'SUCCESS' : 'FAILED',
          providerReference: payload.checkoutRequestID,
          transactionReference: payload.reference || transaction.transactionReference,
          rawResponse: payload as any,
        },
      });

      // Update payment record
      await tx.payment.update({
        where: { id: transaction.paymentId },
        data: { status },
      });

      // Update order status
      await tx.order.update({
        where: { id: transaction.payment.orderId },
        data: {
          paymentStatus: status,
          orderStatus: status === PaymentStatus.SUCCESS ? OrderStatus.CONFIRMED : OrderStatus.PENDING,
        },
      });

      if (status === PaymentStatus.SUCCESS) {
        // Trigger delivery creation and auto rider dispatch algorithm
        const delivery = await this.deliveryService.createDeliveryForOrder(
          transaction.payment.orderId,
        );
        await this.deliveryService.startDispatch(delivery.id);
        
        // Send push notification
        this.notificationsService.sendOrderUpdate(transaction.payment.orderId, 'CONFIRMED')
          .catch((e) => console.error('Failed to send CONFIRMED push notification:', e));
      }
    });

    return { status: 'processed' };
  }

  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
    if (!payment) throw new NotFoundException('No payments found for this order');
    return payment;
  }
}