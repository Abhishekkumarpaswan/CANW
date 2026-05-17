import React, { useEffect, useState } from "react";
import { dashboardAPI } from "../utils/api";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await dashboardAPI.getInsights();
      setInsights(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch insights");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Productivity Insights</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Notes Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Total Notes</div>
            <div className="text-4xl font-bold text-blue-600">
              {insights?.totalNotes || 0}
            </div>
          </div>

          {/* AI Usage Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">AI Summaries Generated</div>
            <div className="text-4xl font-bold text-purple-600">
              {insights?.aiUsageStats?.find((a) => a.type === "summary")
                ?.count || 0}
            </div>
          </div>

          {/* Total Tags Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">Active Tags</div>
            <div className="text-4xl font-bold text-green-600">
              {insights?.mostUsedTags?.length || 0}
            </div>
          </div>

          {/* Weekly Activity Card */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-gray-500 text-sm">This Week Activity</div>
            <div className="text-4xl font-bold text-orange-600">
              {insights?.weeklyActivity?.length || 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Notes */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Recently Edited</h2>
            <div className="space-y-3">
              {insights?.recentNotes?.length > 0 ? (
                insights.recentNotes.map((note) => (
                  <div
                    key={note._id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <span className="font-medium">{note.title}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No notes yet</p>
              )}
            </div>
          </div>

          {/* Most Used Tags */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Most Used Tags</h2>
            <div className="flex flex-wrap gap-2">
              {insights?.mostUsedTags?.length > 0 ? (
                insights.mostUsedTags.map((item) => (
                  <span
                    key={item.tag}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {item.tag} ({item.count})
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No tags yet</p>
              )}
            </div>
          </div>

          {/* AI Usage Stats */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">AI Usage Stats</h2>
            <div className="space-y-2">
              {insights?.aiUsageStats?.length > 0 ? (
                insights.aiUsageStats.map((stat) => (
                  <div key={stat.type} className="flex justify-between">
                    <span className="capitalize">{stat.type}</span>
                    <span className="font-bold">{stat.count} times</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No AI usage yet</p>
              )}
            </div>
          </div>

          {/* Weekly Activity */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Weekly Activity</h2>
            <div className="space-y-2">
              {insights?.weeklyActivity?.length > 0 ? (
                insights.weeklyActivity.map((day) => (
                  <div key={day._id} className="flex justify-between">
                    <span>{day._id}</span>
                    <span className="font-bold">{day.count} notes</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No activity this week</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
