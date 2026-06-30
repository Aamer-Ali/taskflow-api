import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserData } from './dto/create-user-data.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // private users = [
  //   {
  //     id: '1',
  //     name: 'Alice',
  //     email: 'alice@example.com',
  //     role: UserRole.ADMIN,
  //   },
  //   { id: '2', name: 'Bob', email: 'bob@example.com', role: UserRole.MEMBER },
  //   {
  //     id: '3',
  //     name: 'Charlie',
  //     email: 'alice@example.com',
  //     role: UserRole.MEMBER,
  //   },
  // ];

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // findOne(id: string) {
  //   const user = this.users.find((user) => user.id === id);
  //   if (!user) {
  //     throw new NotFoundException(`User with id ${id} not found`);
  //   }
  //   return user;
  // }

  // create(data: CreateUserDto) {
  //   const emailExists = this.users.some((user) => user.email === data.email);

  //   if (emailExists) {
  //     throw new ConflictException(`User with ${data.email} already in use`);
  //   }

  //   const newUser = {
  //     id: String(this.users.length + 1),
  //     ...data,
  //   };
  //   this.users.push(newUser);
  //   return newUser;
  // }

  // update(id: string, body: UpdateUserDto) {
  //   const index = this.users.findIndex((user) => user.id === id);
  //   if (index === -1) {
  //     throw new NotFoundException(`User with if ${id} not found`);
  //   }
  //   this.users[index] = { ...this.users[index], ...body };
  //   return this.users[index];
  // }

  // remove(id: string): void {
  //   const index = this.users.findIndex((user) => user.id === id);
  //   if (index === -1) {
  //     throw new NotFoundException(`User with if ${id} not found`);
  //   }
  //   this.users.splice(index, 1);
  // }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.userRepository.findOne({ where: { email } });
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException(
        `User with ${createUserDto.email} already in use`,
      );
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const whereCriteria: FindOptionsWhere<User> = {
      email: email,
    };

    return this.userRepository.findOne({
      where: whereCriteria,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true, // <- We need pass word as well.
      },
    });
  }

  async createWithHashedPassword(
    createUserData: CreateUserData,
  ): Promise<User> {
    const user = this.userRepository.create(createUserData);
    return await this.userRepository.save(user);
  }
}
