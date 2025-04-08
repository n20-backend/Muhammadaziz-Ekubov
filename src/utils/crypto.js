import { hash, compare } from "bcrypt";

export const hashPassword = async (password, saltRounds = 10) => {
    try {
        const hashedPassword = await hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw new Error('Error hashing password');
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        return await compare(password, hashedPassword);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};