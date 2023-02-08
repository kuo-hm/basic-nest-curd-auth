import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { jwtSecret } from 'src/utils/constants';
import { authDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}
  /* ----------------------------- Sign Up handler ---------------------------- */
  async signUp(dto: authDto) {
    const { email, password } = dto;
    const foundUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (foundUser) {
      throw new BadRequestException('Email already exists!');
    }
    const hashedPassword = await this.hashPassword(password);

    await this.prisma.user
      .create({
        data: {
          email,
          hashPassword: hashedPassword,
        },
      })
      .catch((e) => {
        console.log(e);
      });
    return { message: 'User created Succefully ' };
  }
  /* ----------------------------- Sign In Handler ---------------------------- */
  async signIn(dto, req: Request, res: Response) {
    const { email, password } = dto;
    const foundUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!foundUser) {
      throw new BadRequestException('Wrong credentials!');
    }

    const isMatch = await this.comparePasswords({
      hash: foundUser.hashPassword,
      password,
    });
    if (!isMatch) {
      throw new BadRequestException('Wrong credentials!');
    }
    const token = await this.signToken({
      userId: foundUser.id,
      email: foundUser.email,
    });
    console.log('here');
    if (!token) {
      throw new ForbiddenException('Could not signin');
    }

    res.set({ authentification: `Bearer ${token}` });
    return res.send({ message: 'Logged out succefully' });
  }
  /* ---------------------------- Sign Out Handler ---------------------------- */
  async signOut() {
    return { message: 'Return' };
  }
  /* ------------------------ Hashing password Handler ------------------------ */
  async hashPassword(password: string) {
    const saltOrRounds = 10;

    return await bcrypt.hash(password, saltOrRounds);
  }
  /* ----------------------- Comparing password Handler ----------------------- */
  async comparePasswords(args: { hash: string; password: string }) {
    return await bcrypt.compare(args.password, args.hash);
  }
  /* ------------------------------- JWT Handler ------------------------------ */
  async signToken(args: { userId: string; email: string }) {
    const payload = {
      id: args.userId,
      email: args.email,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: jwtSecret,
    });

    return token;
  }
}
