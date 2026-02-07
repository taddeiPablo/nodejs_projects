import { Router } from 'express';
import { ExpressUserController } from './ExpressUserController';

const controller = new ExpressUserController();
const ExpressUserRouter = Router();


/**
 * @swagger
 * /users:
 *      get:
 *          summary: Obtiene la lista de usuarios
 *      responses:
 *              200:
 *                  description: OK
 */
ExpressUserRouter.get('/', controller.getAll);
ExpressUserRouter.get('/:id', controller.getOneById);
ExpressUserRouter.post('/', controller.create);
ExpressUserRouter.put('/:id', controller.edit);
ExpressUserRouter.delete('/:id', controller.delete);

export { ExpressUserRouter};