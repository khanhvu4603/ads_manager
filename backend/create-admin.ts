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
    const password = 'admin123';

    const existingUser = await usersRepository.findOne({ where: { username } });

    if (existingUser) {
        console.log(`✅ User "${username}" already exists.`);
    } else {
        console.log(`⏳ Creating user "${username}"...`);
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);

        const newUser = usersRepository.create({
            username,
            password_hash: hash,
            role: 'admin', // Explicitly set role
        });

        await usersRepository.save(newUser);
        console.log(`🎉 Successfully created user "${username}" with password "${password}"`);
    }

    await app.close();
}

bootstrap();
