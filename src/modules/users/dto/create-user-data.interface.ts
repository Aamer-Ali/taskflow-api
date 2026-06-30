import { UserRole } from '../entities/user.entity';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
