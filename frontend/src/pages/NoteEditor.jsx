import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notesAPI } from "../utils/api";
import { useNotesStore } from "../utils/store";
import toast from "react-hot-toast";

const DRAFT_STORAGE_KEY = "canw-note-draft";

const NoteEditor = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { updateNote: updateNoteStore, addNote } = useNotesStore();
  const [note, setNote] = useState({
    title: "",
    content: "",
    tags: "",
    category: "personal",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("Draft not saved yet");
  const [currentNoteId, setCurrentNoteId] = useState(noteId || null);
  const [isReady, setIsReady] = useState(false);
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedSnapshotRef = useRef("");

  useEffect(() => {
    if (noteId) {
      setCurrentNoteId(noteId);
      fetchNote();
      return;
    }

    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setNote((currentNote) => ({
          ...currentNote,
          ...parsedDraft,
        }));
        setSaveMessage("Local draft restored");
        lastSavedSnapshotRef.current = JSON.stringify(getPayload(parsedDraft));
      } catch (error) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    }

    setIsReady(true);
  }, [noteId]);

  const fetchNote = async () => {
    try {
      const response = await notesAPI.getById(noteId);
      const data = response.data.data;
      const hydratedNote = {
        ...data,
        tags: data.tags.join(", "),
      };
      setNote(hydratedNote);
      lastSavedSnapshotRef.current = JSON.stringify(getPayload(hydratedNote));
      setSaveMessage("All changes saved");
      setIsReady(true);
    } catch (error) {
      toast.error("Failed to fetch note");
      navigate("/notes");
    }
  };

  useEffect(() => {
    if (!isReady || currentNoteId) {
      return;
    }

    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(note));

    if (!note.title.trim()) {
      setSaveMessage("Draft saved locally. Add a title to sync.");
      return;
    }

    setSaveMessage("Unsaved changes");
  }, [note, isReady, currentNoteId]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const payload = getPayload(note);
    const snapshot = JSON.stringify(payload);

    if (snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    if (!payload.title) {
      return;
    }

    setSaveMessage("Unsaved changes");
    clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      void persistNote({ showToast: false });
    }, 1200);

    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, [note, isReady, currentNoteId]);

  useEffect(() => {
    return () => clearTimeout(autoSaveTimeoutRef.current);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote({ ...note, [name]: value });
  };

  const getPayload = (noteState) => ({
    title: (noteState.title || "").trim(),
    content: noteState.content || "",
    tags: (noteState.tags || "")
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean),
    category: noteState.category || "personal",
  });

  const persistNote = async ({ showToast }) => {
    const payload = getPayload(note);
    const snapshot = JSON.stringify(payload);

    if (!payload.title) {
      if (showToast) {
        toast.error("Title is required");
      }
      return false;
    }

    const setSavingState = showToast ? setIsSubmitting : setIsAutoSaving;
    setSavingState(true);
    setSaveMessage("Saving...");

    try {
      let savedNote;

      if (currentNoteId) {
        const response = await notesAPI.update(currentNoteId, payload);
        savedNote = response.data.data;
        updateNoteStore(savedNote);
      } else {
        const response = await notesAPI.create(payload);
        savedNote = response.data.data;
        setCurrentNoteId(savedNote._id);
        addNote(savedNote);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }

      lastSavedSnapshotRef.current = snapshot;
      setSaveMessage("All changes saved");

      if (showToast) {
        toast.success(currentNoteId ? "Note updated!" : "Note created!");
      }

      return true;
    } catch (error) {
      setSaveMessage("Save failed");
      if (showToast) {
        toast.error(error.response?.data?.message || "Failed to save note");
      }
      return false;
    } finally {
      setSavingState(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const saved = await persistNote({ showToast: true });
    if (saved) {
      navigate("/notes");
    }
  };

  const isCreating = !currentNoteId;
  const isSaving = isSubmitting || isAutoSaving;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          {isCreating ? "Create Note" : "Edit Note"}
        </h1>
        <p className="mb-4 text-sm text-gray-500">
          {saveMessage}
        </p>

        <form
          onSubmit={handleSave}
          className="bg-white p-8 rounded-lg shadow-md space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={note.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Note title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              name="content"
              value={note.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Write your note here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                name="category"
                value={note.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="study">Study</option>
                <option value="ideas">Ideas</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={note.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save & Close"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/notes")}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteEditor;
