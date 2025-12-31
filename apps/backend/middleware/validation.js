import { z } from "zod";

/**
 * Validation middleware factory
 * Creates Express middleware that validates request data against a Zod schema
 * 
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Validate the request against the schema
      // The schema should have properties: body, params, query
      const validationResult = await schema.safeParseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!validationResult.success) {
        // Format Zod errors into a user-friendly format
        const errors = validationResult.error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors,
        });
      }

      // Replace req.body, req.params, req.query with validated (and potentially transformed) values
      if (validationResult.data.body) {
        req.body = validationResult.data.body;
      }
      if (validationResult.data.params) {
        req.params = validationResult.data.params;
      }
      if (validationResult.data.query) {
        req.query = validationResult.data.query;
      }

      next();
    } catch (error) {
      console.error("Validation middleware error:", error);
      return res.status(500).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }
  };
};

/**
 * Simple validation middleware for params only
 */
export const validateParams = (schema) => {
  return validate(z.object({ params: schema }));
};

/**
 * Simple validation middleware for body only
 */
export const validateBody = (schema) => {
  return validate(z.object({ body: schema }));
};

/**
 * Simple validation middleware for query only
 */
export const validateQuery = (schema) => {
  return validate(z.object({ query: schema }));
};
