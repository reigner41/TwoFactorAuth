import { Request, Response } from "express"
import { stringify } from "querystring";
import { getRepository } from "typeorm";
import {User} from "../entity/user.entity";
import { sign, verify } from "jsonwebtoken";
const speakeasy = require("speakeasy");
var bcrypt = require('bcryptjs');

export const Register = async (req: Request, res: Response) => {
    const body = req.body;
    if (body.password !== body.password_confirm){
        return res.status(400).send({
            message: "Password does not match"
        })
    }

    const user = await getRepository(User).save({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: await bcrypt.hash(body.password, 12)
    });

    const responseValue = {
        "first_name" : user?.first_name,
        "last_name" : user?.last_name,
        "email" : user?.email,
    }
    res.send(responseValue);
}

export const Login = async (req: Request, res: Response) => {
    const body = req.body;
    const emailReq = body.email;
    const user = await getRepository(User).findOne({
        where: {
            email: emailReq
        }
    });
    if (!user) {
        return res.status(400).send({
            message: "Invalid Credentials"
        })
    }

    if (!await bcrypt.compare(req.body.password, user.password)){
        return res.status(400).send({
            message: "Invalid Credentials"
        })
    }
    if (user.tfa_secret){
        return res.send({
            id: user.id
        })
    }

    const secret = speakeasy.generateSecret({
        name: "My App"
    });
    return res.send({
        id: user.id,
        secret: secret.ascii,
        otpauth_url: secret.otpauth_url
    })
}

export const TwoFactor = async (req: Request, res: Response) => {
    try {

        const id = req.body.id;
        const repository = getRepository(User);
        const user = await repository.findOne({
            where: {
                id: id
            }
        });

        if (!user){
            return res.status(400).send({
                message: "Invalid Credentials"
            })
        }

        const secret = user.tfa_secret.length > 0  ? user.tfa_secret : req.body.secret;
        
        const verified = speakeasy.totp.verify({
            secret,
            encoding: "ascii",
            token: req.body.code
        });
        console.log(verified);
        if (!verified){
            return res.status(400).send({
                message: "Invalid Credentials"
            })
        }
        console.log(user.tfa_secret.length)
        if (user.tfa_secret.length === 0) {
            const update = await repository.update(id, {tfa_secret: secret})
            console.log(update);
        }

        const accessToken = sign({
            id: id
        }, process.env.ACCESS_SECRET || "", {expiresIn: "30s"})

        const refreshToken = sign({
            id: id
        }, process.env.REFRESH_SECRET || "", {expiresIn: "1w"})

        res.cookie('access_token',accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.cookie('refresh_token',refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.send({
            message: "Success"
        });
    } catch (e) {
        return res.status(400).send({
            message: "Invalid Credentials"
        })
    }
}

export const AuthenticatedUser = async (req: Request, res: Response) => {
    try{
    
    
    const cookie = req.cookies['access_token'];
    const payload: any = verify(cookie, process.env.ACCESS_SECRET || "");
    if (!payload){
        return res.status(401).send({
            message: "Unauthenticated"
        })
    }
    const user = await getRepository(User).findOne({
        where: {
            id: payload.id
        }
    });
    const responseValue = {
        "first_name" : user?.first_name,
        "last_name" : user?.last_name,
        "email" : user?.email,
    }
    return res.send(responseValue);
    }catch (e){
        return res.status(401).send({
            message: "Unauthenticated"
        })
    }

}

export const Refresh = async (req: Request, res: Response) => {
    try {
        const cookie = req.cookies['refresh_token'];
        const payload: any = verify(cookie, process.env.REFRESH_SECRET || "");

        if (!payload){
            return res.status(401).send({
                message: "Unauthenticated"
            })
        }

        const accessToken = sign({
            id: payload.id
        }, process.env.ACCESS_SECRET || "", {expiresIn: "30s"})

        res.cookie('access_token',accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });


        return res.send({
            message: "Success"
        })
    } catch (e) {
        return res.status(401).send({
            message: "Unauthenticated"
        })
    }
}

export const Logout = async (req: Request, res: Response) => {
    res.cookie("access_token", '', {maxAge: 0});
    res.cookie("refresh_token", '', {maxAge: 0});
    return res.send({
        message: "Success"
    })
}