import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    const payload = await this.jwt.verifyAsync<{ sub: string; email: string; role: Role }>(refreshToken, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshHash || !(await bcrypt.compare(refreshToken, user.refreshHash))) {
      throw new ForbiddenException('Refresh token rejected');
    }
    return this.issueTokens(user.id, user.email, user.role);
  }

  async createUser(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, Number(this.config.get('BCRYPT_ROUNDS', 12)));
    const user = await this.prisma.user.create({ data: { email: dto.email, name: dto.name, role: dto.role, passwordHash } });
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  private async issueTokens(sub: string, email: string, role: Role) {
    const accessToken = await this.jwt.signAsync({ sub, email, role }, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: this.config.get('JWT_ACCESS_TTL', '15m') });
    const refreshToken = await this.jwt.signAsync({ sub, email, role }, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_TTL', '7d') });
    await this.prisma.user.update({ where: { id: sub }, data: { refreshHash: await bcrypt.hash(refreshToken, Number(this.config.get('BCRYPT_ROUNDS', 12))) } });
    return { accessToken, refreshToken, user: { id: sub, email, role } };
  }
}
