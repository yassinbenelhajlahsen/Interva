import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { FirebaseAdminProvider } from "./firebase-admin.provider";
import { FirebaseAuthGuard } from "./firebase-auth.guard";

@Module({
  providers: [
    FirebaseAdminProvider,
    FirebaseAuthGuard,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AuthModule {}
