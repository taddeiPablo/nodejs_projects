import { User } from "../domain/User";
import { UserId } from "../domain/UserId";
import { UserRepository } from "../domain/UserRepository";

export class InMemoryUserRepository implements UserRepository {
        private users: User[] = [];

    async create(user: User): Promise<void> {
        this.users.push(user);
    }
    async getAll(): Promise<User[]> {
        return this.users;
    }
    async getById(id: string): Promise<User | null> {
        const user = this.users.find(user => user.id.value === id);
        return user || null;
    }
    async update(user: User): Promise<void> {
        const index = this.users.findIndex(u => u.id.value === user.id.value);
        if (index !== -1) {
            this.users[index] = user;
        }
    }
    async delete(id: string): Promise<void> {
        this.users = this.users.filter(user => user.id.value !== id);
    }
}