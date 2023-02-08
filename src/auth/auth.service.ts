import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { accessSecret, refreshSecret } from 'src/utils/constants';
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
    const user = await this.prisma.user
      .create({
        data: {
          email,
          hashPassword: hashedPassword,
        },
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Credentials incorrect');
          }
        }
        throw error;
      });

    const token = await this.signToken({
      userId: user.id,
      email: user.email,
    });
    await this.updateRtHash(user.id, token.refresh);
    return token;
  }
  /* ----------------------------- Sign In Handler ---------------------------- */
  async signIn(dto) {
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
    if (!token) {
      throw new ForbiddenException('Could not signin');
    }
    await this.updateRtHash(foundUser.id, token.refresh);
    return token;
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

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: '1min',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });
    return { access: accessToken, refresh: refreshToken };
  }
  /* ------------------- Update Refresh password to user Db ------------------- */
  async updateRtHash(userId: string, rt: string): Promise<void> {
    const saltOrRounds = 10;

    const hash = await await bcrypt.hash(rt, saltOrRounds);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        hashRefresh: hash,
      },
    });
  }
}
