import validator from 'validator';

// Validate email address
export const validateEmail = (email) => {
    return validator.isEmail(email);
};

// Validate URL
export const validateURL = (url) => {
    return validator.isURL(url);
};

// Validate UUID
export const validateUUID = (uuid) => {
    return validator.isUUID(uuid);
};

// Validate Phone Number
export const validatePhoneNumber = (phone) => {
    return validator.isMobilePhone(phone, 'uz-UZ');
};

// Validate Number
export const validateNumeric = (input) => {
    return validator.isNumeric(input);
};

// Validate Date
export const validateDate = (date) => {
    return validator.isDate(date);
};

// Validate JSON
export const validateJSON = (str) => {
    return validator.isJSON(str);
};
