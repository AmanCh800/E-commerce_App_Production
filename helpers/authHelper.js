import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
    try {
        const saltRounds = 10;
        const encryptPassword = await bcrypt.hash(password, saltRounds);
        return encryptPassword;
    } catch (error) {
        console.log(error);
    }
};

export const comparePassword = async (password, encryptPassword) => {
    return bcrypt.compare(password, encryptPassword);
};