import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserData } from '../users/dto/create-user-data.interface';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // T0 check if the user is already exists with email or not and for other operations like generate tokens etc
    private readonly jwtService: JwtService, // For Creating the Tokens
    private readonly configService: ConfigService, // To get / use the env variable for tokens and other operations
  ) {}

  // ------ Register new user -------
  async register(registerDto: RegisterDto): Promise<User> {
    //Check if email is already there
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    //If email is there throw ConflictException
    if (existingUser) {
      throw new ConflictException(
        `Email ${registerDto.email} is already registered`,
      );
    }

    //Hash the password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    //Create a user with hashed password
    const userWithHashedPassword: CreateUserData = {
      ...registerDto,
      password: hashedPassword,
    };

    const user = await this.usersService.createWithHashedPassword(
      userWithHashedPassword,
    );

    return user;
  }

  // ----- Login user
  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {
    // Find user by email with password
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );

    // If no user UnauthorizedException
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //match the password
    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    //not match UnauthorizedException
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //generate tokens both
    const tokens = await this.generateTokens(user);

    //descturcture passwrod and userwithout passowrd
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userDataWithoutPassword } = user;

    //return tokens, user
    return {
      ...tokens,
      user: userDataWithoutPassword,
    };
  }

  // ----- Create a refresh token -------
  async refreshTokens(refreshToken: string): Promise<{ accessToken: string }> {
    //Verify Refresh Token

    const verifyOptions: JwtVerifyOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    };
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      refreshToken,
      verifyOptions,
    );

    //find user still exists

    const user = await this.usersService.findOne(payload.sub);

    //generate access token
    const accessToken = await this.generateAccessToken(user);

    ///return access token
    return { accessToken };
  }

  // ----- Helper Methods ------
  private async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtOptions: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: Number(
        this.configService.get<number>('JWT_ACCESS_EXPIRES') ?? 900,
      ),
    };

    return this.jwtService.signAsync(payload, jwtOptions);
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtOptions: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn:
        this.configService.get<number>('JWT_REFRESH_EXPIRES') ?? 604800,
    };

    return this.jwtService.signAsync(payload, jwtOptions);
  }
}
