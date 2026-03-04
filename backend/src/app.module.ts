import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ApplicationsModule } from "./applications/applications.module";
import { RoundsModule } from "./rounds/rounds.module";
import { AiModule } from "./ai/ai.module";

@Module({
  imports: [PrismaModule, AuthModule, ApplicationsModule, RoundsModule, AiModule],
})
export class AppModule {}
