import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (token) => set({ accessToken: token }),
  setAuth: (user, token) =>
    set({ user, accessToken: token, isAuthenticated: !!user }),

  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));

export const useNotesStore = create((set) => ({
  notes: [],
  currentNote: null,
  filter: {
    search: "",
    tag: "",
    category: "all",
    archived: "active",
    sortBy: "recent",
  },

  setNotes: (notes) => set({ notes }),
  setCurrentNote: (note) => set({ currentNote: note }),
  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  addNote: (note) => set((state) => ({ notes: [note, ...state.notes] })),
  updateNote: (updatedNote) =>
    set((state) => ({
      notes: state.notes.map((n) =>
        n._id === updatedNote._id ? updatedNote : n,
      ),
      currentNote:
        state.currentNote?._id === updatedNote._id
          ? updatedNote
          : state.currentNote,
    })),
  deleteNote: (noteId) =>
    set((state) => ({
      notes: state.notes.filter((n) => n._id !== noteId),
      currentNote: state.currentNote?._id === noteId ? null : state.currentNote,
    })),
}));

export const useDashboardStore = create((set) => ({
  insights: null,
  loading: false,

  setInsights: (insights) => set({ insights }),
  setLoading: (loading) => set({ loading }),
}));
