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

    updateBook: async (token, id, payload) => {
        const res = await fetch(`${API_BASE}/api/books/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("updateBook failed");
        return await res.json();
    },
    // relectura
    rereadBook: (token, id) =>
        authFetch(`/api/books/${id}/reread`, {
            token,
            method: "POST",
        }),

    // buscar libro Open Library
    searchOpenLibrary: async (query) => {
        function isISBN(q) {
            const cleaned = q.replace(/[-\s]/g, "");
            return /^\d{10}(\d{3})?$/.test(cleaned);
        }

        let url;

        if (isISBN(query)) {
            url = `https://openlibrary.org/search.json?isbn=${encodeURIComponent(query)}&limit=10`; // 10 resultados
        } else {
            url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`;
        }
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
            throw new Error("Error buscando en Open Library");
        }

        return data;
    },
    getOpenLibraryWork: async (workKey) => {
        if (!workKey) return null;
        const path = workKey.startsWith("/") ? workKey : `/${workKey}`;
        const res = await fetch(`https://openlibrary.org${path}.json`);
        if (!res.ok) return null;
        return await res.json();
    },

    getOpenLibraryAuthor: async (authorKey) => {
        if (!authorKey) return null;
        const path = authorKey.startsWith("/") ? authorKey : `/authors/${authorKey}`;
        const res = await fetch(`https://openlibrary.org${path}.json`);
        if (!res.ok) return null;
        return await res.json();
    },

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

    listAllNotes: (token, params = {}) => {
        const qs = new URLSearchParams();

        if (params.bookId) qs.set("bookId", params.bookId);
        if (params.q) qs.set("q", params.q);
        if (params.onlyQuotes) qs.set("onlyQuotes", "1");
        if (params.limit) qs.set("limit", String(params.limit));

        const query = qs.toString();
        const path = query ? `/api/notes?${query}` : "/api/notes";

        return authFetch(path, { token });
    },

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
    // reviews todas (publicas y privadas)
    getMyReviews: (token) => authFetch("/api/reviews/mine", { token }),
    // reviews anónimas
    getReviewsFeed: (token, params = {}) => {
        const qs = new URLSearchParams();

        if (params.q) qs.set("q", params.q);
        if (params.limit) qs.set("limit", String(params.limit));

        const query = qs.toString();
        const path = query ? `/api/reviews/feed?${query}` : "/api/reviews/feed";

        return authFetch(path, { token });
    },

    // AI companion
    // enviar nota backend para crear reflexión
    readingCompanionReflect: (token, payload) =>
        authFetch("/api/ai/reflection", {
            token,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload || {}),
        }),
    // generar reflexión nota en concreto (para que sea persistente)
    generateNoteCompanion: (token, noteId) =>
        authFetch(`/api/notes/${noteId}/ai-companion`, {
            token,
            method: "POST",
        }),
    // guardamos respuestas del lector a las preguntas creadas por IA
    updateNoteCompanion: (token, noteId, payload) =>
        authFetch(`/api/notes/${noteId}/ai-companion`, {
            token,
            method: "PATCH", // actualizamos
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload || {}),
        }),

    // book of the day
    // book of the day sin IA
    getBookOfDay: (token) => authFetch("/api/discover/book-of-day", { token }),
    getBookOfDayFeedback: (token) => authFetch("/api/discover/book-of-day/feedback", { token }),
    sendBookOfDayFeedback: (token, value) =>
        authFetch("/api/discover/book-of-day/feedback", {
            token,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
        }),
    getBookOfDayAI: (token) => authFetch("/api/discover/book-of-day-ai", { token }),

    getBookOfDayAIFeedback: (token) => authFetch("/api/discover/book-of-day-ai/feedback", { token }),

    sendBookOfDayAIFeedback: (token, value) =>
        authFetch("/api/discover/book-of-day-ai/feedback", {
            token,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value }),
        }),
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
    deleteShelf: (token, id) =>
        authFetch(`/api/shelves/${id}`, {
            token,
            method: "DELETE",
        }),

};
