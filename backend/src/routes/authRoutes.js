import express from 'express';
import { deleteUserByEmail, login, logout, register } from '../controllers/authControllers.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.delete("/deleteUser", deleteUserByEmail);

export default authRouter;