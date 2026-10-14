import Joi from "joi";
const VALID_CATEGORIES = ["Work", "Study", "Personal"]
const VALID_PRIORITIES = ["Low", "Medium", "High"]
export const noteSchema = Joi.object({
    title: Joi.string().min(3).required(),
    content: Joi.string().min(10).required(),
    category: Joi.string().valid(...VALID_CATEGORIES).required(),
    priority: Joi.string().valid(...VALID_PRIORITIES).required(),
});

export const idSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

export const patchNoteSchema = Joi.object({
    title: Joi.string().min(3),
    content: Joi.string().min(10),
    category: Joi.string().valid(...VALID_CATEGORIES),
    priority: Joi.string().valid(...VALID_PRIORITIES),
});

export const cursorpaginationQuerySchema = Joi.object({
    cursor: Joi.number().integer().positive().allow(null).optional(),
    pageSize: Joi.number().integer().min(1).max(100).default(10)
});

export const createTenantSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required()
});