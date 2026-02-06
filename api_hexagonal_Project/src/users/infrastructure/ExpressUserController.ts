import { ServiceContainer } from './../../shared/infrastructure/ServiceContainer';
import { Request, Response, NextFunction } from 'express';

export class ExpressUserController {

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await ServiceContainer.user.getAll.run();
            return res.json(users).status(200);
        } catch (error) {
            
        }
    }

    async getOneById(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error) {  

        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, name, email, created_at } = req.body as { id: string, name: string, email: string, created_at: string };
            const user = await ServiceContainer.user.create.run(id, name, email, created_at);
            return res.json(user).status(201);
        } catch (error) {
            next(error);
        }
    }

    async edit(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error) {
            
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            
        } catch (error) {
            
        }
    }
}