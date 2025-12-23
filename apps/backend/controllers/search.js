import { searchService } from "../services/search.js";

export const smartSearch = async (req, res) => {
  try {
    const userId = req.userId;
    const { search } = req.body;

    if (!search) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await searchService.smartSearch(search, userId);

    return res.status(200).json({
      success: true,
      message: "Search results",
      data: results,
    });
  } catch (error) {
    console.error("Smart search error:", error);
    return res.status(500).json({ error: "Failed to perform search" });
  }
};
