import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/providers/database/database.module';
import { APP_GUARD } from '@nestjs/core';
import { BearerAuthGuard } from '@guards/bearerAuth.guard';
import { UserRecordModule } from '@providers/user/user-record.module';

@Module({
    imports: [
        DatabaseModule,
        UserRecordModule,
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true, // Makes ConfigModule available globally
            envFilePath: '.env', // Specify your .env file path
        }),
    ],
    controllers: [AppController], // AboutController is a Test Controller
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: BearerAuthGuard,
        },
    ],
})
export class AppModule {}
