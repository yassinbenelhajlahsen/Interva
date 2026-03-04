import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import type { User } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator";
import { RoundsService } from "./rounds.service";
import { CreateRoundDto } from "./dto/create-round.dto";
import { UpdateRoundDto } from "./dto/update-round.dto";

@Controller()
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Get("applications/:applicationId/rounds")
  findByApplication(
    @CurrentUser() user: User,
    @Param("applicationId") applicationId: string,
  ) {
    return this.roundsService.findByApplication(user.id, applicationId);
  }

  @Get("rounds/:id")
  findOne(@CurrentUser() user: User, @Param("id") id: string) {
    return this.roundsService.findOne(user.id, id);
  }

  @Post("applications/:applicationId/rounds")
  create(
    @CurrentUser() user: User,
    @Param("applicationId") applicationId: string,
    @Body() dto: CreateRoundDto,
  ) {
    return this.roundsService.create(user.id, applicationId, dto);
  }

  @Patch("rounds/:id")
  update(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body() dto: UpdateRoundDto,
  ) {
    return this.roundsService.update(user.id, id, dto);
  }

  @Delete("rounds/:id")
  @HttpCode(204)
  remove(@CurrentUser() user: User, @Param("id") id: string) {
    return this.roundsService.remove(user.id, id);
  }
}
