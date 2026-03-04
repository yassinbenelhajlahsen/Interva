import { Injectable, InternalServerErrorException } from "@nestjs/common";
import OpenAI from "openai";
import { PrismaService } from "../prisma/prisma.service";
import { RoundsService } from "../rounds/rounds.service";

@Injectable()
export class AiService {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(
    private readonly prisma: PrismaService,
    private readonly roundsService: RoundsService,
  ) {}

  async generateQuestions(userId: string, roundId: string) {
    const round = await this.roundsService.findOwned(userId, roundId);
    const { application } = round;

    const prompt = `You are an interview coach. Generate exactly 5 interview questions for the following context:

Role: ${application.role}
Company: ${application.company}
Interview round type: ${round.roundType}
${application.jobDescription ? `Job description: ${application.jobDescription}` : ""}

Return only a JSON array of 5 strings, each being a question. No extra text.`;

    let questions: string[];
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(content) as { questions?: string[] };
      questions = parsed.questions ?? [];
    } catch {
      throw new InternalServerErrorException("Failed to generate questions");
    }

    if (!questions.length) {
      throw new InternalServerErrorException("No questions returned from AI");
    }

    await this.prisma.generatedQuestion.createMany({
      data: questions.map((questionText) => ({
        interviewRoundId: roundId,
        questionText,
      })),
    });

    return this.prisma.generatedQuestion.findMany({
      where: { interviewRoundId: roundId },
      orderBy: { createdAt: "asc" },
    });
  }
}
