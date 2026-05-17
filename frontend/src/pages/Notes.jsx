import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notesAPI, aiAPI } from "../utils/api";
import { useNotesStore } from "../utils/store";
import toast from "react-hot-toast";

const Notes = () => {
  const navigate = useNavigate();
  const { notes, setNotes, filter, setFilter } = useNotesStore();
  const [loading, setLoading] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [filter]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await notesAPI.getAll(filter);
      setNotes(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure?")) {
      try {
        await notesAPI.delete(noteId);
        setNotes(notes.filter((n) => n._id !== noteId));
        toast.success("Note deleted");
      } catch (error) {
        toast.error("Failed to delete note");
      }
    }
  };

  const handleGenerateSummary = async (noteId) => {
    setGeneratingSummary(noteId);
    try {
      const response = await aiAPI.generateSummary(noteId);
      const updatedNote = notes.find((n) => n._id === noteId);
      if (updatedNote) {
        updatedNote.summary = response.data.data.summary;
        updatedNote.actionItems = response.data.data.actionItems;
        updatedNote.suggestedTitle = response.data.data.suggestedTitle;
        setNotes([...notes]);
      }
      toast.success("Summary generated!");
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setGeneratingSummary(null);
    }
  };

  const handleToggleArchive = async (note) => {
    try {
      const response = await notesAPI.archive(note._id, {
        isArchived: !note.isArchived,
      });
      const updatedNote = response.data.data;

      if (
        filter.archived === "all" ||
        (filter.archived === "active" && !updatedNote.isArchived) ||
        (filter.archived === "archived" && updatedNote.isArchived)
      ) {
        setNotes(notes.map((n) => (n._id === updatedNote._id ? updatedNote : n)));
      } else {
        setNotes(notes.filter((n) => n._id !== updatedNote._id));
      }

      toast.success(
        updatedNote.isArchived ? "Note archived" : "Note restored to active",
      );
    } catch (error) {
      toast.error("Failed to update archive status");
    }
  };

  const handleShareNote = async (noteId) => {
    try {
      const response = await notesAPI.generateShareLink(noteId);
      const shareUrl = response.data.data.shareUrl;
      setNotes(
        notes.map((note) =>
          note._id === noteId ? { ...note, isPublic: true } : note,
        ),
      );
      navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to generate share link");
    }
  };

  const handleRevokeShare = async (noteId) => {
    try {
      await notesAPI.revokeShareLink(noteId);
      setNotes(
        notes.map((note) =>
          note._id === noteId
            ? { ...note, isPublic: false, shareToken: undefined }
            : note,
        ),
      );
      toast.success("Share link revoked");
    } catch (error) {
      toast.error("Failed to revoke share link");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Notes</h1>
          <button
            onClick={() => navigate("/notes/create")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Note
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search notes..."
              value={filter.search}
              onChange={(e) => setFilter({ search: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />

            <select
              value={filter.category}
              onChange={(e) => setFilter({ category: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="study">Study</option>
              <option value="ideas">Ideas</option>
            </select>

            <select
              value={filter.archived}
              onChange={(e) => setFilter({ archived: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="active">Active Notes</option>
              <option value="archived">Archived Notes</option>
              <option value="all">All Notes</option>
            </select>

            <input
              type="text"
              placeholder="Filter by tag..."
              value={filter.tag}
              onChange={(e) => setFilter({ tag: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            />
          </div>

          <select
            value={filter.sortBy}
            onChange={(e) => setFilter({ sortBy: e.target.value })}
            className="w-full md:w-48 px-4 py-2 border rounded-lg"
          >
            <option value="recent">Recent</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title</option>
          </select>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="text-center py-12">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No notes found. Create your first note!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-lg font-bold mb-2">{note.title}</h3>

                {note.content && (
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {note.content}
                  </p>
                )}

                {note.summary && (
                  <div className="bg-blue-50 p-2 mb-2 rounded text-sm">
                    <strong>Summary:</strong> {note.summary.substring(0, 100)}
                    ...
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-200 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/notes/${note._id}`)}
                    className="flex-1 bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleGenerateSummary(note._id)}
                    disabled={generatingSummary === note._id}
                    className="flex-1 bg-purple-100 text-purple-600 px-3 py-1 rounded text-sm hover:bg-purple-200 disabled:opacity-50"
                  >
                    {generatingSummary === note._id ? "Generating..." : "AI"}
                  </button>

                  <button
                    onClick={() =>
                      note.isPublic
                        ? handleRevokeShare(note._id)
                        : handleShareNote(note._id)
                    }
                    className="flex-1 bg-green-100 text-green-600 px-3 py-1 rounded text-sm hover:bg-green-200"
                  >
                    {note.isPublic ? "Revoke" : "Share"}
                  </button>

                  <button
                    onClick={() => handleToggleArchive(note)}
                    className="flex-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm hover:bg-yellow-200"
                  >
                    {note.isArchived ? "Unarchive" : "Archive"}
                  </button>

                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="flex-1 bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
