import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateApplicationDto } from "./dto/create-application.dto";
import { UpdateApplicationDto } from "./dto/update-application.dto";

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  create(userId: string, dto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: { ...dto, userId },
    });
  }

  async update(userId: string, id: string, dto: UpdateApplicationDto) {
    await this.findOwned(userId, id);
    return this.prisma.application.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    return this.prisma.application.delete({ where: { id } });
  }

  async findOwned(userId: string, id: string) {
    const app = await this.prisma.application.findUnique({ where: { id } });
    if (!app || app.userId !== userId) throw new NotFoundException();
    return app;
  }
}
