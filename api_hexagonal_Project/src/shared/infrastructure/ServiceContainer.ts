
import { InMemoryUserRepository } from "../../users/infrastructure/inMemoryUserRepository";
import { UserCreate } from "../../users/application/UserCreate";
import { UserGetAll } from "../../users/application/UserGetAll";

const userRepository = new InMemoryUserRepository();

export const ServiceContainer = {
    user: {
        create: new UserCreate(userRepository),
        getAll: new UserGetAll(userRepository)
    }
}