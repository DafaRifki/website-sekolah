import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError } from "../utils/response.util";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
      validatedBody?: any;
    }
  }
}

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return sendError(res, "Validation error", errorMessage, 400);
    }

    req.body = value;
    req.validatedBody = value;
    next();
  };
};

export const validate = validateBody;

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return sendError(res, "Query validation error", errorMessage, 400);
    }

    // Store validated query in a new property
    req.validatedQuery = value;

    next();
  };
};

// Optional: Validation for params
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return sendError(res, "Params validation error", errorMessage, 400);
    }

    req.params = value;
    next();
  };
};
