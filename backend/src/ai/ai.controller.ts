import { Controller, Param, Post } from "@nestjs/common";
import type { User } from "@prisma/client";
import { CurrentUser } from "../auth/current-user.decorator";
import { AiService } from "./ai.service";

@Controller("rounds/:id/generate-questions")
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  generate(@CurrentUser() user: User, @Param("id") id: string) {
    return this.aiService.generateQuestions(user.id, id);
  }
}
