import Joi from "joi";
import type { Schema } from "joi";

export const shiftParamsSchema: Schema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const shiftCreateSchema: Schema = Joi.object({
  startTime: Joi.date()
    .iso()
    .greater("now")
    .required()
    .messages({
      "date.greater": "Shifts must start in the future",
      "date.format": "Start time must be a valid ISO date",
    }),
  endTime: Joi.date()
    .iso()
    .greater(Joi.ref("startTime"))
    .required()
    .messages({
      "date.greater": "End time must be after start time",
      "date.format": "End time must be a valid ISO date",
    }),
});

export const shiftUpdateSchema: Schema = Joi.object({
  startTime: Joi.date()
    .iso()
    .required()
    .messages({
      "date.format": "Start time must be a valid ISO date",
    }),
  endTime: Joi.date()
    .iso()
    .required()
    .messages({
      "date.format": "End time must be a valid ISO date",
    }),
});

export const shiftWorthQuerySchema: Schema = Joi.object({
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref("startTime")).required(),
  excludeId: Joi.number().integer().positive().optional(),
});
