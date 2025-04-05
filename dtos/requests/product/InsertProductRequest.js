import Joi from "joi";

class InsertProductRequest {
  constructor(data) {
    this.name = data.name;
    this.price = data.price;
    this.oldprice = data.oldprice;
    this.image = data.image;
    this.description = data.description;
    this.specification = data.specification;
    this.stock = data.stock;
    this.rating = data.rating;
    this.total_ratings = data.total_ratings;
    this.total_sold = data.total_sold;
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
      stock: Joi.number().integer().min(0).optional().messages({
        "number.min": "Số lượng tồn kho không được âm.",
      }),
      rating: Joi.number().min(0).max(5).optional().messages({
        "number.min": "Rating phải lớn hơn hoặc bằng 0.",
        "number.max": "Rating không được lớn hơn 5.",
      }),
      total_ratings: Joi.number().integer().min(0).optional(),
      total_sold: Joi.number().integer().min(0).optional(),
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
