const Joi = require('joi')

module.exports = Joi.object({
    slug: Joi.string().optional(),
    title: Joi.string().min(4).required(),
    description: Joi.string().min(4).required(),
    markdown: Joi.string().min(4).required()
})