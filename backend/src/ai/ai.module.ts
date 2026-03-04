import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { RoundsModule } from "../rounds/rounds.module";

@Module({
  imports: [RoundsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
