import Joi from "joi";

export const changeRankBodySchema = Joi.object({
  groupId: Joi.number().integer().positive().required(),
  userid: Joi.number().integer().positive().required(),
  role: Joi.number().integer().positive().required(),
});

export const getGamePassesQuerySchema = Joi.object({
  universeid: Joi.string().trim().required(),
});

export const getUserGamesQuerySchema = Joi.object({
  userid: Joi.string().trim().required(),
});

export const getSpecialTagQuerySchema = Joi.object({
  user: Joi.string().trim().required(),
});

export const webhookProxyQuerySchema = Joi.object({
  url: Joi.string()
    .trim()
    .pattern(/^https:\/\/discord\.com\/api\/webhooks\/.+/)
    .required(),
}).unknown(true);

export const webhookProxyBodySchema = Joi.object({
  content: Joi.string().allow("").optional(),
  embed: Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string().optional(),
    color: Joi.number().integer().optional(),
    thumbnail: Joi.string().uri().optional(),
    image: Joi.string().uri().optional(),
    fields: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
        inline: Joi.boolean().optional(),
      })
    ).optional(),
  }).optional(),
}).or("content", "embed");
