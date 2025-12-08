import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';
import { User } from './src/users/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

    const username = 'admin';
    const password = 'admin123'; // Default password

    const existingUser = await usersRepository.findOne({ where: { username } });

    if (existingUser) {
        console.log('Admin user already exists.');
        existingUser.role = 'admin';
        await usersRepository.save(existingUser);
        console.log('Updated existing admin user role to admin.');
    } else {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);

        const newUser = usersRepository.create({
            username,
            password_hash: hash,
            role: 'admin',
        });

        await usersRepository.save(newUser);
        console.log(`Admin user created with username: ${username} and password: ${password}`);
    }

    await app.close();
}

bootstrap();
