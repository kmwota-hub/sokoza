import { Controller, Post, Get, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiateStkPushDto } from './dto/initiate-stkpush.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stkpush')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate M-Pesa STK Push payment for order' })
  stkPush(@CurrentUser() user: any, @Body() dto: InitiateStkPushDto) {
    return this.paymentsService.initiateStkPush(user.id, dto);
  }

  @Post('mpesa/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Public M-Pesa Callback Endpoint' })
  callback(@Body() body: any) {
    // Handle standard Daraja format mappings
    const checkoutRequestID = body?.Body?.stkCallback?.CheckoutRequestID;
    const resultCode = body?.Body?.stkCallback?.ResultCode;
    const resultDesc = body?.Body?.stkCallback?.ResultDesc;
    const callbackMetadata = body?.Body?.stkCallback?.CallbackMetadata?.Item;
    // Map metadata back or extract mock values
    const amount = callbackMetadata?.find((i: any) => i.Name === 'Amount')?.Value || 0;
    const reference = callbackMetadata?.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value || `MOCK-${Date.now()}`;

    return this.paymentsService.processCallback({
      merchantRequestID: body?.Body?.stkCallback?.MerchantRequestID || '',
      checkoutRequestID,
      resultCode,
      resultDesc,
      reference,
      amount,
    });
  }

  @Get(':orderId/status')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current payment status' })
  getStatus(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }
}