import Joi from "joi";
export const noteSchema = Joi.object({
    title: Joi.string().min(3).required(),
    content: Joi.string().min(10).required(),
    category: Joi.string().valid("Work","Study","Personal").required(),
    priority: Joi.string().valid("Low","Medium","High").required(),
});

export const idSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

export const patchNoteSchema = Joi.object({
    title: Joi.string().min(3),
    content: Joi.string().min(10),
    category: Joi.string().valid("Work","Study","Personal"),
    priority: Joi.string().valid("Low","Medium","High"),
});