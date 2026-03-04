import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ApplicationsService } from "../applications/applications.service";
import { CreateRoundDto } from "./dto/create-round.dto";
import { UpdateRoundDto } from "./dto/update-round.dto";

@Injectable()
export class RoundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly applicationsService: ApplicationsService,
  ) {}

  async create(userId: string, applicationId: string, dto: CreateRoundDto) {
    await this.applicationsService.findOwned(userId, applicationId);
    return this.prisma.interviewRound.create({
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
        applicationId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateRoundDto) {
    await this.findOwned(userId, id);
    return this.prisma.interviewRound.update({
      where: { id },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    return this.prisma.interviewRound.delete({ where: { id } });
  }

  async findOwned(userId: string, id: string) {
    const round = await this.prisma.interviewRound.findUnique({
      where: { id },
      include: { application: true },
    });
    if (!round || round.application.userId !== userId) {
      throw new NotFoundException();
    }
    return round;
  }
}
