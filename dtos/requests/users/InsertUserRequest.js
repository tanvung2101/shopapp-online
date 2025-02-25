import Joi from "joi";
import { UserRole } from "../../../constants";

class InsertUserRequest{
    constructor(data) {
        this.email = data.email
        this.password = data.password;
        this.name = data.name
        this.avatar = data.avatar
        this.phone = data.phone
    }


    static validate(data) {
        const schema = Joi.object({
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).required(),
            name: Joi.string().required(),
            avatar: Joi.string().uri().allow('').optional(),
            phone: Joi.string().optional()
        });
        return schema.validate(data); //{error, value}
    }
}
export default InsertUserRequest