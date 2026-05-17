import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Note } from "../models/note.model.js";
import { AiUsageLog } from "../models/aiUsageLog.model.js";

const getDashboardInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const totalNotes = await Note.countDocuments({ owner: userId });

  const recentNotes = await Note.find({ owner: userId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .select("title updatedAt");

  const tags = await Note.aggregate([
    { $match: { owner: userId } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const aiUsage = await AiUsageLog.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalTokens: { $sum: "$tokensUsed" },
      },
    },
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyActivity = await Note.aggregate([
    {
      $match: {
        owner: userId,
        updatedAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalNotes,
        recentNotes,
        mostUsedTags: tags.map((t) => ({ tag: t._id, count: t.count })),
        aiUsageStats: aiUsage.map((a) => ({
          type: a._id,
          count: a.count,
          totalTokens: a.totalTokens,
        })),
        weeklyActivity,
      },
      "Dashboard insights fetched successfully",
    ),
  );
});

export { getDashboardInsights };
