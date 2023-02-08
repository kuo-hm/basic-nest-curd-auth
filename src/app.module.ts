import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GalleryModule } from './gallery/gallery.module';
import { TodosModule } from './todos/todos.module';
import { UsersModule } from './users/users.module';
@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    TodosModule,
    GalleryModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
