import Joi from "joi";

class InsertProductRequest {
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
    this.attributes = data.attributes;
  }

  static validate(data) {
    const schema = Joi.object({
      name: Joi.string().required(),
      price: Joi.number().positive().required(),
      oldprice: Joi.number().positive(),
      image: Joi.string().allow(""),
      description: Joi.string().optional(),
      specification: Joi.string().required(),
      buyturn: Joi.number().integer().min(0),
      quantity: Joi.number().integer().required(),
      brand_id: Joi.number().integer().required(),
      category_id: Joi.number().integer().required(),
      attributes: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(), // màng hình , ram,
            value: Joi.string().required(), // 17inch, 16G
          })
        )
        .optional(),
    });
    return schema.validate(data); //{error, value}
  }
}
export default InsertProductRequest;
