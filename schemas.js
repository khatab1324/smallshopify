const BaseJoi = require("joi");
//joi for for validation
const sanitizeHtml = require("sanitize-html");

//I git it from colt he wrtie it, its bilud on express validation
const extension = (joi) => ({
  //now I am define extension and pass joi
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          // this packeg cine from the libary that I required it //for more https://www.npmjs.com/package/sanitize-html
          // now its like this if some write script like <script>alrat("here I am")</script> thes code will go to this sanitize and it would be like this sanitizeHtml('<script>alrat("here I am")</script>') and it will return ""
          allowedTags: [], //that mean don't exapt tags
          allowedAttributes: {}, //that mean don't exapt attributes and that mean don't expact almost any thing
        });
        if (clean !== value)
          //I check to see if there's a difference between the the input that was passed in and then the sanitized output. And if there was a difference, that means something was removed. Then we just return this helpers error string dot escape html that's defined up here.
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});
const Joi = BaseJoi.extend(extension);
// to use extension you should say Joi.extend//because of that I will make joi to baseJoi
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(), //evry time we have text
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImages: Joi.array(), //you can find deleteImages in edit.ejs line 90
});
//its normalto add to module.exports
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(), //escapeHTML come from above extantion
  }).required(), //required its so important because without it you willn't can use it
});
