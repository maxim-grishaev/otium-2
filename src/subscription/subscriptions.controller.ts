import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Req,
  Request,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import type { SelectPlanDto } from '../dto/SelectPlanDto';
import { getUser } from '../lib/getUser';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    @Inject(SubscriptionsService)
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getAvailablePlans();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-plan')
  async getMyPlan(@Request() req: Request) {
    return this.subscriptionsService.getSubscription(getUser(req).id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('select-plan')
  @HttpCode(HttpStatus.OK)
  async selectPlan(@Req() req: Request, @Body() selectPlanDto: SelectPlanDto) {
    return this.subscriptionsService.selectPlan(getUser(req).id, selectPlanDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('cancel-plan')
  @HttpCode(HttpStatus.OK)
  async cancelPlan(@Req() req: Request) {
    return this.subscriptionsService.cancelSubscription(getUser(req).id);
  }
}
