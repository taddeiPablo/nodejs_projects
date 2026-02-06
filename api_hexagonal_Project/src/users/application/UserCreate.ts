import { User } from "../domain/User";
import { UserCreatedAt } from "../domain/UserCreatedAt";
import { UserEmail } from "../domain/UserEmail";
import { UserName } from "../domain/UserName";
import { UserId } from "../domain/UserId";

import { UserRepository } from "../domain/UserRepository";

export class UserCreate{
    constructor(private repository: UserRepository){}

    async run (id: string, name: string, email: string, created_at: string): Promise<void>{
        const user = new User(new UserId(id), new UserName(name), new UserEmail(email), new UserCreatedAt(created_at));
        await this.repository.create(user);
    }
}