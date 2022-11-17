import {Router} from "express";
import { Register, Login, AuthenticatedUser, Refresh, Logout, TwoFactor } from "./controller/auth.controller";
import { Forgot } from "./controller/auth.forgotcontroller";

export const routes = (router: Router) => {
    router.post('/api/register', Register)
    router.post('/api/login', Login)
    router.post('/api/two-factor', TwoFactor)
    router.get('/api/getuser', AuthenticatedUser)
    router.post('/api/refresh', Refresh)
    router.post('/api/logout', Logout)
    router.post('/api/forgot', Forgot)
}