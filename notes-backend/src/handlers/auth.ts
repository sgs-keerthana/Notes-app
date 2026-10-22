import type Hapi from "@hapi/hapi";
import Boom from "@hapi/boom";
import Jwt from "@hapi/jwt";
import bcrypt  from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";
import { UserModel } from "../models/index.js";

const getJwtSecret =(): string=>{
    const secret = process.env.JWT_SECRET;
    if(!secret || secret.length<32){
        throw new Error("JWT_SECRET must be set and contain at least 32 characters");
    }
    return secret;
};
type AuthPayload={email: string; password: string };
export const register = async (request: Hapi.Request,h:Hapi.ResponseToolkit)=>{
    try{
    const {email, password}=request.payload as AuthPayload;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await UserModel.findOne({where:{email:normalizedEmail}});
    if(existingUser){
        throw Boom.conflict("An account with this email already exists");
}
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await UserModel.create({
        id: createId(),
        email: normalizedEmail,
        passwordHash,
        createdAt: new Date(),
    });
    return h.response({
        message: "Registration successful. Please log in.",
        user:{id: user.id,email:user.email},
    }).code(201);
} catch (error){
    console.error("REGISTRATION ERROR:",error);
    throw error;
}
};

export const login = async (request: Hapi.Request,h: Hapi.ResponseToolkit)=>{
    const { email, password} = request.payload as AuthPayload;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await UserModel.findOne({where:{email:normalizedEmail}});
    if (!user || !(await bcrypt.compare(password,user.passwordHash))){
        throw Boom.unauthorized("Invalid email or password");
    }
    const token=Jwt.token.generate(
        {sub: user.id, email: user.email},
        {key: getJwtSecret(), algorithm: "HS256"},
        { ttlSec: 60*60}
    );
    return {
        message: "Login successful",
        token,
        tokenType: "Bearer",
        expiresIn: 3600,
        user: {id: user.id,email: user.email},
    };

};
