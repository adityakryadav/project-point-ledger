const Joi = require("joi");

// PAN format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
// This schema validates inputs for a simulated NSDL PAN verification request.
const nsdlPanVerificationSchema = Joi.object({
  pan_number: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.empty": "pan_number is required",
      "string.pattern.base": "pan_number must be a valid PAN (e.g., ABCDE1234F)",
    }),
  name: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "name is required",
    "string.min": "name must be at least 2 characters",
    "string.max": "name must be at most 100 characters",
  }),
}).required();

module.exports = { nsdlPanVerificationSchema };

