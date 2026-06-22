import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AboutController } from './about.controller';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { DatabaseService } from './common/providers/database/database.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: '.env', // Specify your .env file path
    }),
  ],
  controllers: [AppController], // AboutController is a Test Controller
  providers: [AppService],
})
export class AppModule {}