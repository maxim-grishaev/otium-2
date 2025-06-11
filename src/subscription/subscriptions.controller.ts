import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import type { SelectPlanDto } from '../dto/SelectPlanDto';
import type { User } from '../db/schema';

() => SubscriptionsService;

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  async getPlans() {
    return this.subscriptionsService.getAvailablePlans();
  }

  @UseGuards(AuthGuard('jwt')) // Protect this route
  @Post('select-plan')
  @HttpCode(HttpStatus.OK)
  async selectPlan(
    @Request() req: { user: User }, // req.user is populated by JWT strategy
    @Body() selectPlanDto: SelectPlanDto,
  ) {
    const userId = req.user.id; // Get userId from the authenticated user
    return this.subscriptionsService.selectPlan(userId, selectPlanDto);
  }
}
