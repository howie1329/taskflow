import { searchService } from "../services/search.js";
import { BaseOperationHandler } from "./base.js";

export const smartSearch = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { search } = req.body;

    if (!search) {
      const error = new Error("Search query is required");
      error.statusCode = 400;
      throw error;
    }

    const results = await searchService.smartSearch(search, userId);
    return results;
  });
};
