import Joi from "joi";

class InsertBannerRequest{
    constructor(data) {
        this.name = data.name
        this.image = data.image
        this.status = data.status
        this.product_ids = data.product_ids
    }

    static validate(data) {
        const schema = Joi.object({
            name: Joi.string().required(),
            image: Joi.string().allow('', null),
            status: Joi.number().integer().min(1).required(),
        });
        return schema.validate(data); //{error, value}
    }
}
export default InsertBannerRequest