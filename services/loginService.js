import { executeQuery } from "../database/database.js";

const checkExistingUsers = async (email) => {
    return await executeQuery("SELECT * FROM users WHERE email = $1", email);
}

const registerNewUser = async (email, hash) => {
    await executeQuery("INSERT INTO users (email, password) VALUES ($1, $2);", email, hash);
}

export {checkExistingUsers, registerNewUser}