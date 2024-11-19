const Joi = require('joi')

module.exports = {
    signup: Joi.object({
        name: Joi.string().min(4).message('Name must be at least 4 digits').required(),
        username: Joi.string().pattern(new RegExp('^[a-z0-9]+$'))
            .message('username must contain small alphabetical characters only')
            .min(4)
            .message("'username' must be at least 4 characters")
            .required(),
        password: Joi.string()
            .pattern(new RegExp('^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$'))
            .message("Password doesn't match our rules")
            .required()
    }),
    updateData: Joi.object({
        name: Joi.string().min(4).message('name must be at least 4 digits').required(),
        username: Joi.string()
            .pattern(new RegExp('^[a-z0-9]+$'))
            .min(4)
            .message("'username' must be at least 4 characters")
            .required(),
        bio: Joi.string().allow('').optional(),
        description: Joi.string().allow('').optional()
    })
}