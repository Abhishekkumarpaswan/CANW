import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { publicAPI } from "../utils/api";
import toast from "react-hot-toast";

const SharedNote = () => {
  const { shareToken } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSharedNote();
  }, [shareToken]);

  const fetchSharedNote = async () => {
    try {
      const response = await publicAPI.getSharedNote(shareToken);
      setNote(response.data.data);
    } catch (error) {
      toast.error("Note not found or has been revoked");
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

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Note Not Found</h1>
          <p className="text-gray-600">
            This shared note doesn't exist or has been revoked.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold mb-4">{note.title}</h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-4">Content</h2>
            <p className="whitespace-pre-wrap text-gray-700">{note.content}</p>
          </div>

          {note.summary && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
              <h2 className="text-lg font-bold mb-2">AI Summary</h2>
              <p className="text-gray-700">{note.summary}</p>
            </div>
          )}

          {note.actionItems?.length > 0 && (
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
              <h2 className="text-lg font-bold mb-2">Action Items</h2>
              <ul className="list-disc list-inside space-y-2">
                {note.actionItems.map((item, idx) => (
                  <li key={idx} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {note.suggestedTitle && (
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6">
              <h2 className="text-lg font-bold mb-2">Suggested Title</h2>
              <p className="text-gray-700">{note.suggestedTitle}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>
              Category:{" "}
              <span className="font-semibold capitalize">{note.category}</span>
            </p>
            <p>Last updated: {new Date(note.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedNote;
