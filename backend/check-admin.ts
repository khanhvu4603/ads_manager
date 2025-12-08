import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { User } from './src/users/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

    const admin = await usersRepository.findOne({ where: { username: 'admin' } });
    console.log('Admin Role:', admin?.role);

    await app.close();
}

bootstrap();
