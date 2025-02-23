import Joi from "joi";

class UpdateProductRequest{
    constructor(data) {
        this.name = data.name;
        this.price = data.price;
        this.oldprice = data.oldprice;
        this.image = data.image;
        this.description = data.description;
        this.specification = data.specification;
        this.buyturn = data.buyturn;
        this.quantity = data.quantity;
        this.brand_id = data.brand_id;
        this.category_id = data.category_id;
    }

    static validate(data) {
        const schema = Joi.object({
          name: Joi.string().optional(),
          price: Joi.number().positive().optional(),
          oldprice: Joi.number().positive().optional(),
          image: Joi.string().allow("").optional(),
          description: Joi.string().optional(),
          specification: Joi.string().optional(),
          buyturn: Joi.number().integer().min(0).optional(),
          quantity: Joi.number().integer().optional(),
          brand_id: Joi.number().integer().optional(),
          category_id: Joi.number().integer().optional(),
        });
        return schema.validate(data); //{error, value}
    }
}
export default UpdateProductRequest