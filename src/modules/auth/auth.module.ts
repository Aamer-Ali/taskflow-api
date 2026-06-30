import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // Import UsersModule to use UsersService
    PassportModule,
    UsersModule,
    JwtModule.register({}),
    // Empty config here — we pass secrets
    // dynamically in AuthService.generateTokens()
    // This gives us flexibility to use
    // different secrets for access vs refresh tokens
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
