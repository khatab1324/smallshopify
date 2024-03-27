const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");
const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});
const Joi = BaseJoi.extend(extension);
module.exports.storeSchema = Joi.object({
  // store: Joi.object({
  title: Joi.string().required().escapeHTML(),
  location: Joi.string().required().escapeHTML(),
  description: Joi.string().required().escapeHTML(),
  // author: Joi.string().required().escapeHTML(),
  pin: Joi.string().required().escapeHTML(),
  pinConfig: Joi.string().required().escapeHTML(),
  // username: Joi.string().required().escapeHTML(),
  // email: Joi.string().required().escapeHTML(),
  // }).required(),
  deleteImages: Joi.array(),
});

module.exports.storeUpdateSchema = Joi.object({
  title: Joi.string().required().escapeHTML(),
  location: Joi.string().required().escapeHTML(),
  description: Joi.string().required().escapeHTML(),
  pin: Joi.string().required().escapeHTML(),
  deleteImages: Joi.array(),
});
module.exports.productSchema = Joi.object({
  title: Joi.string().required().escapeHTML(),
  description: Joi.string().required().escapeHTML(),
  quantity: Joi.number().greater(0).required(),
  price: Joi.number().greater(0).required(),
  deleteImages: Joi.array(),
});
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required().escapeHTML(),
  }).required(),
});
