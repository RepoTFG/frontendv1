// añado aquí todas las llamadas al backend

const API_BASE = process.env.REACT_APP_API_URL;

// añado el helper --> parsea json de forma segura (por si hay respuesta vacía)
async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function authFetch(path, { token, ...options } = {}) {
    if (!API_BASE) throw new Error("REACT_APP_API_URL no está definido");
    if (!token) throw new Error("Token requerido (authFetch)");

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
        },
    });

    const data = await safeJson(res);

    if (!res.ok) {
        const msg = data?.error || `Error HTTP ${res.status}`;
        throw new Error(msg);
    }

    return data;
}

// endpoints
export const api = {
    me: (token) => authFetch("/api/me", { token }),

    listBooks: (token) => authFetch("/api/books", { token }),

    createBook: (token, payload) =>
        authFetch("/api/books", {
            token,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),

    patchBook: (token, id, payload) =>
        authFetch(`/api/books/${id}`, {
            token,
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),

    deleteBook: (token, id) =>
        authFetch(`/api/books/${id}`, { token, method: "DELETE" }),

    // notes
    listNotes: (token, bookId) => authFetch(`/api/books/${bookId}/notes`, { token }),

    createNote: (token, bookId, payload) =>
        authFetch(`/api/books/${bookId}/notes`, {
            token,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),

    deleteNote: (token, noteId) =>
        authFetch(`/api/notes/${noteId}`, { token, method: "DELETE" }),

    patchNote: (token, noteId, payload) =>
        authFetch(`/api/notes/${noteId}`, {
            token,
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),

    // review
    getMyReview: (token, bookId) => authFetch(`/api/books/${bookId}/review`, { token }),

    putMyReview: (token, bookId, payload) =>
        authFetch(`/api/books/${bookId}/review`, {
            token,
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),

    // públicas (sin token)
    getPublicReviews: async (bookId) => {
        const res = await fetch(`${API_BASE}/api/reviews/public?bookId=${bookId}`);
        const data = await safeJson(res);
        if (!res.ok) throw new Error(data?.error || "Error al cargar reseñas públicas");
        return data;
    },

    // shelves
    listShelves: (token) => authFetch("/api/shelves", { token }),

    createShelf: (token, payload) =>
        authFetch("/api/shelves", {
            token,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),

    toggleBookShelf: (token, bookId, payload) =>
        authFetch(`/api/books/${bookId}/shelves/toggle`, {
            token,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }),
};
