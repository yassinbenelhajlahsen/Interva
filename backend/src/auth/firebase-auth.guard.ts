import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { app } from "firebase-admin";
import * as admin from "firebase-admin";
import { Request } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { FIREBASE_ADMIN } from "./firebase-admin.provider";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FIREBASE_ADMIN) private readonly firebaseApp: app.App,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Missing auth token");
    }

    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await this.firebaseApp.auth().verifyIdToken(token);
    } catch {
      throw new UnauthorizedException("Invalid auth token");
    }

    const user = await this.prisma.user.upsert({
      where: { firebaseUid: decodedToken.uid },
      update: {},
      create: {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email ?? "",
      },
    });

    (request as any).user = user;
    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
  }
}
