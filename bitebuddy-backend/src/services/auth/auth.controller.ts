import { Request, Response } from "express";
import authService from './auth.class';


export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const response = await authService.register(name, email, password);
        console.log('response is', response);
        res.status(201).json(response);
    } catch (error: any) {
        res.status(400).json({ message: error.message })
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};