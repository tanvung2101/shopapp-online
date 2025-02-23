import Joi from "joi";

class InsertProductImageRequest {
  constructor(data) {
    this.product_id = data.product_id;
    this.image_url = data.image_url;
  }

  static validate(data) {
    const schema = Joi.object({
      product_id: Joi.number().integer().required(),
      image_url: Joi.string().required(),
    });
    return schema.validate(data); //{error, value}
  }
}
export default InsertProductImageRequest