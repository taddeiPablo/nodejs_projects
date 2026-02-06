import { User } from './User';

export interface UserRepository {
    create(user: User): Promise<void>;
    getAll(): Promise<User[]>;
    getById(id: string): Promise<User | null>;
    update(user: User): Promise<void>;
    delete(id: string): Promise<void>;
}