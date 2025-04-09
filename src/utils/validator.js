import { z } from 'zod';

// Validate email address
export const validateEmail = (email) => {
    return z.string().email().safeParse(email).success;
};
z
// Validate URL
export const validateURL = (url) => {
    return z.string().url().safeParse(url).success;
};

// Validate UUID
export const validateUUID = (uuid) => {
    return z.string().uuid().safeParse(uuid).success;
};

// Validate Phone Number
export const validatePhoneNumber = (phone) => {
    return z.string().regex(/^[0-9]{10}$/).safeParse(phone).success;
};

// Validate Number
export const validateNumeric = (input) => {
    return z.number().safeParse(input).success;
};

// Validate Date
export const validateDate = (date) => {
    return z.string().date().safeParse(date).success;
};

// Validate JSON
export const validateJSON = (str) => {
    return z.string().json().safeParse(str).success;
};

// Validate Password
export const validatePassword = (password) => {
    return z.string().min(8).max(32).safeParse(password).success;
};

