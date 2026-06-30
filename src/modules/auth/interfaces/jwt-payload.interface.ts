import { UserRole } from 'src/modules/users/entities/user.entity';

export interface JwtPayload {
  sub: number; // user id (sub = subject — JWT standard)
  email: string;
  role: UserRole;
}
