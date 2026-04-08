/**
 * @description Base Operation Handler
 * Operation Handler
 * @param {Request} req - The request object
 * @param {Response} res - The response object
 * @param {Function} operation - The operation to handle
 * @param {any[]} args - The arguments to pass to the operation
 * @returns {Promise<Response>} The response object
 */
export const BaseOperationHandler = async (req, res, operation, ...args) => {
  try {
    const result = await operation(req, ...args);

    // Handle 404 cases - if result is null/undefined, return 404
    if (result === null || result === undefined) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
        error: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Operation completed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in BaseOperationHandler", error);

    // Handle custom error status codes (if error has statusCode property)
    const statusCode = error.statusCode || 500;
    const errorMessage = error.message || "Internal Server Error";

    // Set appropriate message based on status code
    let message = "Internal Server Error";
    if (statusCode === 404) {
      message = "Resource not found";
    } else if (statusCode === 400) {
      message = "Bad Request";
    }

    return res.status(statusCode).json({
      success: false,
      message: message,
      error: errorMessage,
    });
  }
};
