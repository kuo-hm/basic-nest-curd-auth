import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { authDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: authDto) {
    return this.authService.signUp(dto);
  }
  @Post('signin')
  signIn(@Body() dto: authDto, @Req() req, @Res() res) {
    return this.authService.signIn(dto, req, res);
  }
  @Get('signout')
  signOut() {
    return this.authService.signOut();
  }
}
