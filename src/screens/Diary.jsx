import { useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import { api } from "../services/api";

export default function Diary({ books, setSelectedBook, styles }) {
    const { ACCENT, SOFT, CARD, BORDER, MUTED } = styles;

    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState([]);

    const [q, setQ] = useState("");
    const [bookId, setBookId] = useState("");

    // tabs (All, Notes, Quotes, Reviews)
    const [tab, setTab] = useState("all");

    // modal crear entrada
    const [newOpen, setNewOpen] = useState(false);
    const [draftBookId, setDraftBookId] = useState("");
    const [noteChapter, setNoteChapter] = useState("");
    const [noteText, setNoteText] = useState("");
    const [noteQuote, setNoteQuote] = useState("");
    const [saving, setSaving] = useState(false);

    // modal: tipo de entrada
    const [newType, setNewType] = useState("note"); // note o review

    // review
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [reviewIsPublic, setReviewIsPublic] = useState(false);
    const [reviews, setReviews] = useState([]);

    const onlyQuotes = tab === "quotes";

    // map para resolver bookId --> info libro
    const bookById = useMemo(() => {
        const m = new Map();
        (Array.isArray(books) ? books : []).forEach((b) => m.set(String(b.id), b));
        return m;
    }, [books]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const token = await auth.currentUser.getIdToken();

            if (tab === "reviews") {
                const data = await api.getMyReviews(token);
                setReviews(Array.isArray(data) ? data : []);
                setNotes([]);
                setLoading(false);
                return;
            }

            const data = await api.listAllNotes(token, {
                q: q.trim() || undefined,
                onlyQuotes: onlyQuotes ? true : undefined,
                bookId: bookId || undefined,
                limit: 300,
            });


            let out = Array.isArray(data) ? data : [];

            // notes --> entradas que no tienen quote
            if (tab === "notes") {
                out = out.filter((n) => !(typeof n.quote === "string" && n.quote.trim()));
            }
            if (tab === "quotes") {
                out = out.filter((n) => typeof n.quote === "string" && n.quote.trim());
            }

            setNotes(out);
        } catch (e) {
            alert(e.message || "Error cargando el Diary");
            setNotes([]);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [q, onlyQuotes, bookId, tab]);

    // cargar al entrar y cambios filtros
    useEffect(() => {
        const t = setTimeout(() => load(), 250);
        return () => clearTimeout(t);
    }, [load]);

    const card = {
        border: `1px solid ${BORDER}`,
        borderRadius: 18,
        background: CARD,
        padding: 14,
    };

    const inputStyle = {
        padding: 12,
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: SOFT,
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        fontSize: 14,
    };

    const ghostBtn = {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: CARD,
        color: ACCENT,
        cursor: "pointer",
        width: "100%",
        fontWeight: 800,
    };

    const primaryBtn = {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${ACCENT}`,
        background: ACCENT,
        color: "white",
        cursor: "pointer",
        width: "100%",
        fontWeight: 800,
    };

    const pill = (active, disabled = false) => ({
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? SOFT : CARD,
        color: ACCENT,
        fontWeight: active ? 900 : 800,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 12,
        opacity: disabled ? 0.45 : 1,
    });

    const openNewEntry = () => {
        // por defecto selecciona el libro filtrado si hay, si no el primero
        const fallback = bookId || (Array.isArray(books) && books[0]?.id ? String(books[0].id) : "");
        setDraftBookId(fallback);

        // reseteo drafts
        setNoteChapter("");
        setNoteText("");
        setNoteQuote("");

        setReviewRating(5);
        setReviewText("");
        setReviewIsPublic(false);

        setNewType("note");
        setNewOpen(true);
    };

    const createEntry = async () => {
        try {
            if (!draftBookId) {
                alert("Selecciona un libro para guardar la entrada.");
                return;
            }

            setSaving(true);
            const token = await auth.currentUser.getIdToken();

            if (newType === "note") {
                if (!noteText.trim()) {
                    alert("Escribe tu nota antes de guardar.");
                    return;
                }

                await api.createNote(token, draftBookId, {
                    chapter: noteChapter || "",
                    text: noteText.trim(),
                    quote: noteQuote || "",
                });

                setNewOpen(false);
                setNoteChapter("");
                setNoteText("");
                setNoteQuote("");
                await load();
                return;
            }

            if (!reviewText.trim()) {
                alert("Escribe tu reseña antes de guardar.");
                return;
            }

            // guardamos review como en BookDetail (PUT /api/books/:id/review)
            await api.putMyReview(token, draftBookId, {
                text: reviewText.trim(),
                rating: Number(reviewRating) || 5,
                isPublic: !!reviewIsPublic,
                isAnonymous: true,
            });

            setNewOpen(false);
            setReviewText("");
            setReviewRating(5);
            setReviewIsPublic(false);
            await load();
        } catch (e) {
            alert(e.message || "Error guardando la entrada");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {/* encabezado y botón new entry */}
                <div style={card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontWeight: 900, color: ACCENT }}>
                            Reading Diary
                        </div>

                        <button
                            type="button"
                            onClick={openNewEntry}
                            style={{
                                padding: "10px 12px",
                                borderRadius: 999,
                                border: `1px solid ${BORDER}`,
                                background: CARD,
                                cursor: "pointer",
                                fontWeight: 900,
                                color: ACCENT,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                whiteSpace: "nowrap",
                            }}
                            title="Crear nueva entrada"
                        >
                            + New entry
                        </button>
                    </div>

                    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => setTab("all")} style={pill(tab === "all")}>
                            All
                        </button>
                        <button type="button" onClick={() => setTab("notes")} style={pill(tab === "notes")}>
                            Notes
                        </button>
                        <button type="button" onClick={() => setTab("quotes")} style={pill(tab === "quotes")}>
                            Quotes
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("reviews")}
                            style={pill(tab === "reviews")}
                        >
                            Reviews
                        </button>
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar en tus entradas (texto, capítulo o cita)"
                            style={inputStyle}
                        />

                        <select
                            value={bookId}
                            onChange={(e) => setBookId(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">Todos los libros</option>
                            {(Array.isArray(books) ? books : []).map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.title || "Sin título"}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* lista */}
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                    {loading ? (
                        <div style={{ opacity: 0.7 }}>Cargando entradas...</div>
                    ) : tab === "reviews" ? (
                        reviews.length === 0 ? (
                            <div style={{ ...card, color: MUTED, fontSize: 13 }}>
                                Todavía no has escrito ninguna reseña.
                            </div>
                        ) : (
                            reviews.map((r) => {
                                const b = bookById.get(String(r.bookId));

                                const fallbackBook = {
                                    id: r.bookId,
                                    title: r.title || "Libro",
                                    author: r.author || "",
                                    cover: { url: r.coverUrl || "" },
                                    status: "to_read",
                                    shelves: [],
                                    openLibrary: { workKey: "", authorKey: "" },
                                    readCount: 0,
                                    _deleted: true,
                                };

                                const bookToOpen = b || fallbackBook;

                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setSelectedBook(bookToOpen)}
                                        style={{
                                            textAlign: "left",
                                            border: `1px solid ${BORDER}`,
                                            borderRadius: 18,
                                            background: CARD,
                                            padding: 14,
                                            cursor: "pointer",
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                            <div style={{ minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 900,
                                                        color: ACCENT,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {bookToOpen.title}
                                                </div>

                                                {bookToOpen.author && (
                                                    <div style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>
                                                        {bookToOpen.author}
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ fontSize: 12, color: MUTED, whiteSpace: "nowrap" }}>
                                                ⭐ {r.rating || "?"}/5
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 8, color: ACCENT, whiteSpace: "pre-wrap" }}>
                                            {r.text}
                                        </div>

                                        <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>
                                            {r.isPublic ? "Reseña pública (anónima)" : "Reseña privada"}
                                            {r.updatedAt ? ` · ${new Date(r.updatedAt).toLocaleDateString()}` : r.createdAt ? ` · ${new Date(r.createdAt).toLocaleDateString()}` : ""}
                                        </div>
                                    </button>
                                );
                            })
                        )
                    ) : notes.length === 0 ? (
                        <div style={{ ...card, color: MUTED, fontSize: 13 }}>
                            No hay entradas todavía. Pulsa “+ New entry” para escribir la primera.
                        </div>
                    ) : (
                        notes.map((n) => {
                            const b = bookById.get(String(n.bookId));
                            const title = b?.title || n.bookTitle || "Libro";
                            const author = b?.author || n.bookAuthor || "";

                            // si el libro no existe, mostrar igualmente info
                            const fallbackBook = {
                                id: n.bookId,
                                title: n.bookTitle || "Libro",
                                author: n.bookAuthor || "",
                                cover: { url: n.bookCoverUrl || "" },
                                status: "to_read",
                                shelves: [],
                                openLibrary: { workKey: "", authorKey: "" },
                                readCount: 0,
                                _deleted: true,
                            };

                            const bookToOpen = b || fallbackBook;

                            return (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => setSelectedBook(bookToOpen)}
                                    style={{
                                        textAlign: "left",
                                        border: `1px solid ${BORDER}`,
                                        borderRadius: 18,
                                        background: CARD,
                                        padding: 14,
                                        cursor: "pointer",
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontWeight: 900,
                                                    color: ACCENT,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {title}
                                            </div>
                                            {author && (
                                                <div style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>
                                                    {author}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ fontSize: 11, color: MUTED, whiteSpace: "nowrap" }}>
                                            {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                                        </div>
                                    </div>

                                    {n.chapter && (
                                        <div style={{ marginTop: 10, fontSize: 12, color: MUTED, fontWeight: 800 }}>
                                            {n.chapter}
                                        </div>
                                    )}

                                    <div style={{ marginTop: 8, color: ACCENT, whiteSpace: "pre-wrap" }}>
                                        {n.text}
                                    </div>

                                    {n.quote && (
                                        <div style={{ marginTop: 8, fontStyle: "italic", color: MUTED }}>
                                            “{n.quote}”
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* modal crear entrada (al igual que en BookDetail) */}
                {newOpen && (
                    <div
                        onClick={() => setNewOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.35)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-end",
                            padding: 16,
                            zIndex: 60,
                        }}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: "100%",
                                maxWidth: 520,
                                borderRadius: 18,
                                border: `1px solid ${BORDER}`,
                                background: CARD,
                                padding: 14,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                <div style={{ fontWeight: 900, color: ACCENT }}>New entry</div>
                                <button onClick={() => setNewOpen(false)} style={{ ...ghostBtn, width: "auto" }} type="button">
                                    Cerrar
                                </button>
                            </div>

                            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                <button type="button" onClick={() => setNewType("note")} style={pill(newType === "note")}>
                                    Nota
                                </button>
                                <button type="button" onClick={() => setNewType("review")} style={pill(newType === "review")}>
                                    Review
                                </button>
                            </div>

                            <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                                <select
                                    value={draftBookId}
                                    onChange={(e) => setDraftBookId(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="">Selecciona un libro</option>
                                    {(Array.isArray(books) ? books : []).map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.title || "Sin título"}
                                        </option>
                                    ))}
                                </select>

                                {newType === "note" ? (
                                    <>
                                        <input
                                            placeholder="Capítulo / parte (opcional)"
                                            value={noteChapter}
                                            onChange={(e) => setNoteChapter(e.target.value)}
                                            style={inputStyle}
                                        />

                                        <textarea
                                            placeholder="Escribe tu nota..."
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            rows={4}
                                            style={{ ...inputStyle, resize: "vertical" }}
                                        />

                                        <input
                                            placeholder="Frase destacada (opcional)"
                                            value={noteQuote}
                                            onChange={(e) => setNoteQuote(e.target.value)}
                                            style={inputStyle}
                                        />

                                        <button
                                            onClick={createEntry}
                                            style={primaryBtn}
                                            type="button"
                                            disabled={saving}
                                        >
                                            {saving ? "Guardando..." : "Guardar nota"}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <select
                                            value={reviewRating} // gusrdamos el score
                                            onChange={(e) => setReviewRating(Number(e.target.value))}
                                            style={{
                                                ...inputStyle,
                                                background: SOFT,
                                                appearance: "none",
                                                WebkitAppearance: "none",
                                            }}
                                        >
                                            <option value={5}>⭐⭐⭐⭐⭐</option>
                                            <option value={4}>⭐⭐⭐⭐</option>
                                            <option value={3}>⭐⭐⭐</option>
                                            <option value={2}>⭐⭐</option>
                                            <option value={1}>⭐</option>
                                        </select>

                                        <textarea
                                            placeholder="Escribe tu reseña del libro..."
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            rows={4}
                                            style={{ ...inputStyle, resize: "vertical" }} // agrandamos solo en vertical
                                        />

                                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                            <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, minWidth: 120 }}>Modo:</div>

                                            <button
                                                onClick={() => {
                                                    // modo privado
                                                    // (no cambia tu reseña, solo el modo de guardado)
                                                    setReviewIsPublic(false);
                                                }}
                                                // ahora tipo pill
                                                style={{
                                                    ...pill(!reviewIsPublic),
                                                    border: `1px solid ${!reviewIsPublic ? ACCENT : BORDER}`,
                                                }}
                                                type="button"
                                            >
                                                Solo para mí
                                            </button>

                                            <button
                                                onClick={() => {
                                                    // modo publico anonimo
                                                    setReviewIsPublic(true);
                                                }}
                                                style={{
                                                    ...pill(!!reviewIsPublic),
                                                    border: `1px solid ${reviewIsPublic ? ACCENT : BORDER}`,
                                                }}
                                                type="button"
                                                title="Publica tu reseña sin mostrar tu identidad"
                                            >
                                                Publicar anónima
                                            </button>
                                        </div>

                                        <button
                                            onClick={createEntry}
                                            style={primaryBtn}
                                            type="button"
                                            disabled={saving}
                                        >
                                            {saving ? "Guardando..." : reviewIsPublic ? "Guardar y publicar anónimamente" : "Guardar reseña (privada)"}
                                        </button>

                                        <div style={{ fontSize: 12, color: MUTED }}>
                                            Estado actual:{" "}
                                            <strong style={{ color: ACCENT }}>{reviewIsPublic ? "Publicada (anónima)" : "Privada"}</strong>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
}
