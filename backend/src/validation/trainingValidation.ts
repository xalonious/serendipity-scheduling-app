import Joi from "joi";
import type { Schema } from "joi";

export const trainingParamsSchema: Schema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

