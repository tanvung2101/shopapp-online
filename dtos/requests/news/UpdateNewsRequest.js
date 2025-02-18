import Joi from "joi";

class UpdateNewsRequest {
  constructor(data) {
    this.title = data.title;
    this.image = data.image;
    this.content = data.content;
  }

  static validate(data) {
    const schema = Joi.object({
      title: Joi.string().optional().allow(null),
      image: Joi.string().uri().allow("", null).optional(),
      content: Joi.string().optional().allow(null),
    });
    return schema.validate(data); //{error, value}
  }
}
export default UpdateNewsRequest;
