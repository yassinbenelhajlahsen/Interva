import { Module } from "@nestjs/common";
import { RoundsController } from "./rounds.controller";
import { RoundsService } from "./rounds.service";
import { ApplicationsModule } from "../applications/applications.module";

@Module({
  imports: [ApplicationsModule],
  controllers: [RoundsController],
  providers: [RoundsService],
  exports: [RoundsService],
})
export class RoundsModule {}
