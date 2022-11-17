import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { ResetPassword } from "../entity/resetpassword.entity";

export const Forgot = async (req: Request, res: Response) => {
    const {email} = req.body;
    const token = Math.random().toString(20).substring(2, 12);
    const reset = await getRepository(ResetPassword).save({
        email,
        token
    })
    return res.send(reset)
}