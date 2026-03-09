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
    // moods
    const MOODS = ["", "relaxed", "thoughtful", "excited", "anxious", "romantic", "curious"];
    const moodLabel = (m) =>
        m === "relaxed" ? "relaxed" :
            m === "thoughtful" ? "thoughtful" :
                m === "excited" ? "excited" :
                    m === "anxious" ? "anxious" :
                        m === "romantic" ? "romantic" :
                            m === "curious" ? "curious" :
                                "—";

    //mood de la nueva nota (opcional)
    const [noteMood, setNoteMood] = useState("");

    // editar nota (igual que en BookDetail)
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editText, setEditText] = useState("");
    const [editChapter, setEditChapter] = useState("");
    const [editQuote, setEditQuote] = useState("");
    const [editMood, setEditMood] = useState("");
    const [editOpen, setEditOpen] = useState(false);
    // IA companion
    const [aiLoadingId, setAiLoadingId] = useState(null);
    const [savingAnswersId, setSavingAnswersId] = useState(null);
    const [draftAnswers, setDraftAnswers] = useState({});
    // para hacer la ux más minimalista
    const [expandedId, setExpandedId] = useState(null);
    const [menuOpenId, setMenuOpenId] = useState(null);

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

    const subtleBtn = {
        padding: "8px 10px",
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        background: "white",
        color: ACCENT,
        cursor: "pointer",
        fontWeight: 800,
        fontSize: 12,
    };

    const menuBtn = {
        width: 34,
        height: 34,
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        background: "white",
        color: ACCENT,
        cursor: "pointer",
        fontWeight: 900,
        fontSize: 18,
        lineHeight: 1,
    };

    const openNewEntry = () => {
        // por defecto selecciona el libro filtrado si hay, si no el primero
        const fallback = bookId || (Array.isArray(books) && books[0]?.id ? String(books[0].id) : "");
        setDraftBookId(fallback);

        // reseteo drafts
        setNoteChapter("");
        setNoteText("");
        setNoteQuote("");
        setNoteMood("");

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
                    mood: noteMood || "", //guardamos mood con la nota
                });

                setNewOpen(false);
                setNoteChapter("");
                setNoteText("");
                setNoteQuote("");
                setNoteMood("");
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

    const empezarEditarNota = (n) => {
        setEditingNoteId(n.id);
        setEditText(n.text || "");
        setEditChapter(n.chapter || "");
        setEditQuote(n.quote || "");
        setEditMood(n.mood || "");
        setEditOpen(true);
        setMenuOpenId(null);
    };

    const cancelarEditarNota = () => {
        setEditingNoteId(null);
        setEditText("");
        setEditChapter("");
        setEditQuote("");
        setEditMood("");
        setEditOpen(false);
    };

    const guardarEdicionNota = async (noteId) => {
        try {
            if (!noteId) return;

            if (!editText.trim()) {
                alert("Escribe tu nota antes de guardar.");
                return;
            }

            const token = await auth.currentUser.getIdToken();

            await api.patchNote(token, noteId, {
                chapter: editChapter || "",
                text: editText.trim(),
                quote: editQuote || "",
                mood: editMood || "",
            });

            setDraftAnswers((prev) => {
                const next = { ...prev };
                delete next[noteId];
                return next;
            });

            cancelarEditarNota();
            await load();
        } catch (e) {
            alert(e.message || "Error guardando la edición");
        }
    };

    const borrarNota = async (noteId) => {
        try {
            if (!noteId) return;

            const ok = window.confirm("¿Seguro que quieres borrar esta nota?");
            if (!ok) return;

            const token = await auth.currentUser.getIdToken();

            await api.deleteNote(token, noteId);

            if (editingNoteId === noteId) cancelarEditarNota();

            setDraftAnswers((prev) => {
                const next = { ...prev };
                delete next[noteId];
                return next;
            });

            if (expandedId === noteId) setExpandedId(null);
            if (menuOpenId === noteId) setMenuOpenId(null);

            await load();
        } catch (e) {
            alert(e.message || "Error borrando la nota");
        }
    };
// AI companion
// reflexiones sobre notas
    const reflectNote = async (n) => {
        try {
            if (!n?.id) return;

            // si ya está abierta --> cerramos tanto tarjeta expandida como menú de opciones
            if (expandedId === n.id) {
                setExpandedId(null);
                setMenuOpenId(null);
                return;
            }
            setAiLoadingId(n.id); // marcamos como cargando
            const token = await auth.currentUser.getIdToken();
            // generamos solo si no existe todavía
            if (!Array.isArray(n.aiCompanion?.questions) || n.aiCompanion.questions.length === 0) {
                await api.generateNoteCompanion(token, n.id); // llamada backend para crear preguntas IA
                await load();
            }
            // abrimos la nota
            setExpandedId(n.id);
            setMenuOpenId(null);
        } catch (e) {
            alert(e.message || "Error generando la reflexión");
        } finally {
            setAiLoadingId(null);
        }
    };
    // obtenemos las 3 respuestas
    const getAnswersForNote = (n) => {
        const fromDraft = draftAnswers[n.id]; // buscamos si habían respuestas
        if (Array.isArray(fromDraft)) return fromDraft;

        const saved = Array.isArray(n.aiCompanion?.answers) ? n.aiCompanion.answers : [];
        return [
            saved[0] || "",
            saved[1] || "",
            saved[2] || "",
        ];
    };
    // actualizamos respuesta concreta del borrador
    const updateDraftAnswer = (noteId, idx, value, noteObj) => {
        setDraftAnswers((prev) => { // usando versión anterior
            // si hay borrador para esa nota --> versión anterior
            // si no --> partir de respuestas guardadas
            const current = Array.isArray(prev[noteId])
                ? prev[noteId]
                : [
                    noteObj?.aiCompanion?.answers?.[0] || "",
                    noteObj?.aiCompanion?.answers?.[1] || "",
                    noteObj?.aiCompanion?.answers?.[2] || "",
                ];
            const next = [...current];
            next[idx] = value; // cambiamos solo la respuesta que corresponde al índice
            return { //actualizamos drafts
                ...prev,
                [noteId]: next,
            };
        });
    };
    // guardamos al backend las respuestas
    const saveCompanionAnswers = async (noteId, noteObj) => {
        try {
            if (!noteId) return;

            setSavingAnswersId(noteId);
            const token = await auth.currentUser.getIdToken();
            const answers = getAnswersForNote(noteObj);
            // enviamos:
            await api.updateNoteCompanion(token, noteId, {
                answers,
            });

            await load();
        } catch (e) {
            alert(e.message || "Error guardando las reflexiones");
        } finally {
            setSavingAnswersId(null);
        }
    };
    // obtenemos texto de la nota como preview cuando la nota está cerrada
    const getPreviewText = (n) => {
        const base = typeof n.text === "string" ? n.text.trim() : "";
        if (!base) return "";
        return base.length > 180 ? `${base.slice(0, 180)}…` : base; // si texto largo --> cortar a 180 caracteres
    };

    const openBook = (n) => {
        const b = bookById.get(String(n.bookId));

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

        setSelectedBook(b || fallbackBook);
        setMenuOpenId(null);
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
                        const companion = n.aiCompanion || null;
                        const hasCompanion = Array.isArray(companion?.questions) && companion.questions.length > 0;
                        const answers = getAnswersForNote(n);
                        const answeredCount = answers.filter((x) => String(x || "").trim()).length;
                        const expanded = expandedId === n.id;

                        return (
                            <div
                                key={n.id}
                                style={{
                                    textAlign: "left",
                                    border: `1px solid ${expanded ? ACCENT : BORDER}`,
                                    borderRadius: 18,
                                    background: CARD,
                                    padding: 14,
                                    transition: "border-color 120ms ease",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setExpandedId((prev) => prev === n.id ? null : n.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                setExpandedId((prev) => prev === n.id ? null : n.id);
                                            }
                                        }}
                                        style={{ minWidth: 0, flex: 1, cursor: "pointer" }}
                                    >
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

                                        <div style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>
                                            {[author, n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""].filter(Boolean).join(" · ")}
                                        </div>

                                        {!expanded && (
                                            <div style={{ marginTop: 8, color: MUTED, fontSize: 13, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
                                                {getPreviewText(n)}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ position: "relative", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                                        <button
                                            type="button"
                                            onClick={() => reflectNote(n)}
                                            style={subtleBtn}
                                            title="Abrir AI companion"
                                            disabled={aiLoadingId === n.id}
                                        >
                                            {aiLoadingId === n.id
                                                ? "Thinking..."
                                                : expanded
                                                    ? "Close companion"
                                                    : hasCompanion
                                                        ? `AI companion · ${answeredCount}/3`
                                                        : "AI companion"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setMenuOpenId((prev) => prev === n.id ? null : n.id)}
                                            style={menuBtn}
                                            title="Más opciones"
                                        >
                                            ⋯
                                        </button>

                                        {menuOpenId === n.id && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: 40,
                                                    right: 0,
                                                    minWidth: 160,
                                                    background: "white",
                                                    border: `1px solid ${BORDER}`,
                                                    borderRadius: 14,
                                                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                                                    padding: 6,
                                                    display: "grid",
                                                    gap: 4,
                                                    zIndex: 5,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => openBook(n)}
                                                    style={{
                                                        ...subtleBtn,
                                                        width: "100%",
                                                        textAlign: "left",
                                                        borderRadius: 10,
                                                    }}
                                                >
                                                    Open book
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => empezarEditarNota(n)}
                                                    style={{
                                                        ...subtleBtn,
                                                        width: "100%",
                                                        textAlign: "left",
                                                        borderRadius: 10,
                                                    }}
                                                >
                                                    Edit note
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => borrarNota(n.id)}
                                                    style={{
                                                        ...subtleBtn,
                                                        width: "100%",
                                                        textAlign: "left",
                                                        borderRadius: 10,
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* mostramos mood si existe  */}
                                {typeof n.mood === "string" && n.mood.trim() && (
                                    <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: MUTED, fontWeight: 800 }}>
                                        <span>Mood:</span>
                                        <span style={{ color: ACCENT }}>{moodLabel(n.mood)}</span>
                                    </div>
                                )}

                                {expanded && (
                                    <>
                                        {n.chapter && (
                                            <div style={{ marginTop: 12, fontSize: 12, color: MUTED, fontWeight: 800 }}>
                                                {n.chapter}
                                            </div>
                                        )}

                                        <div style={{ marginTop: 8, color: ACCENT, whiteSpace: "pre-wrap", lineHeight: 1.55 }}>
                                            {n.text}
                                        </div>

                                        {n.quote && (
                                            <div style={{ marginTop: 10, fontStyle: "italic", color: MUTED, lineHeight: 1.5 }}>
                                                “{n.quote}”
                                            </div>
                                        )}

                                        {hasCompanion && (
                                            <div
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    marginTop: 12,
                                                    border: `1px solid ${BORDER}`,
                                                    borderRadius: 14,
                                                    background: SOFT,
                                                    padding: 12,
                                                    display: "grid",
                                                    gap: 10,
                                                    cursor: "default",
                                                }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                                    <div style={{ fontWeight: 900, color: ACCENT, fontSize: 13 }}>
                                                        Reading companion
                                                    </div>

                                                    <div style={{ color: MUTED, fontSize: 12, fontWeight: 800 }}>
                                                        {answeredCount}/3 answered
                                                    </div>
                                                </div>

                                                {companion.intro ? (
                                                    <div style={{ color: MUTED, fontSize: 13 }}>
                                                        {companion.intro}
                                                    </div>
                                                ) : null}

                                                <div style={{ display: "grid", gap: 10 }}>
                                                    {(companion.questions || []).map((question, idx) => (
                                                        <div key={idx} style={{ display: "grid", gap: 6 }}>
                                                            <div style={{ color: ACCENT, fontSize: 14, lineHeight: 1.45, fontWeight: 800 }}>
                                                                {idx + 1}. {question}
                                                            </div>

                                                            <textarea
                                                                value={answers[idx] || ""}
                                                                onChange={(e) => updateDraftAnswer(n.id, idx, e.target.value, n)}
                                                                placeholder="Write your reflection..."
                                                                rows={3}
                                                                style={{ ...inputStyle, resize: "vertical", background: CARD }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        saveCompanionAnswers(n.id, n);
                                                    }}
                                                    style={primaryBtn}
                                                    type="button"
                                                    disabled={savingAnswersId === n.id}
                                                >
                                                    {savingAnswersId === n.id ? "Saving..." : "Save reflections"}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
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
                                    {/* mood al crear la nota (opcional) */}
                                    <div style={{ display: "grid", gap: 6 }}>
                                        <div style={{ fontSize: 12, color: MUTED, fontWeight: 800 }}>
                                            Mood (opcional)
                                        </div>
                                        <select
                                            value={noteMood}
                                            onChange={(e) => setNoteMood(e.target.value)}
                                            style={inputStyle}
                                            title="¿Cómo te sientes al escribir esta nota?"
                                        >
                                            <option value="">—</option>
                                            {MOODS.filter((m) => m !== "").map((m) => (
                                                <option key={m} value={m}>
                                                    {m}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

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

            {/* modal editar nota */}
            {editOpen && (
                <div
                    onClick={cancelarEditarNota}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.35)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        padding: 16,
                        zIndex: 70,
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
                            <div style={{ fontWeight: 900, color: ACCENT }}>Edit note</div>
                            <button onClick={cancelarEditarNota} style={{ ...ghostBtn, width: "auto" }} type="button">
                                Cerrar
                            </button>
                        </div>

                        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                            {/* mood al editar la nota (opcional) */}
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontSize: 12, color: MUTED, fontWeight: 800 }}>
                                    Mood (opcional)
                                </div>
                                <select
                                    value={editMood}
                                    onChange={(e) => setEditMood(e.target.value)}
                                    style={inputStyle}
                                    title="Actualizar mood de la nota"
                                >
                                    <option value="">—</option>
                                    {MOODS.filter((m) => m !== "").map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <input
                                value={editChapter}
                                onChange={(e) => setEditChapter(e.target.value)}
                                placeholder="Capítulo / parte (opcional)"
                                style={inputStyle}
                            />

                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                rows={5}
                                style={{ ...inputStyle, resize: "vertical" }}
                            />

                            <input
                                value={editQuote}
                                onChange={(e) => setEditQuote(e.target.value)}
                                placeholder="Frase destacada (opcional)"
                                style={inputStyle}
                            />

                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    onClick={() => guardarEdicionNota(editingNoteId)}
                                    style={{
                                        ...primaryBtn,
                                        width: "auto",
                                        flex: 1,
                                    }}
                                    type="button"
                                >
                                    Save changes
                                </button>
                                <button
                                    onClick={cancelarEditarNota}
                                    style={{
                                        ...ghostBtn,
                                        width: "auto",
                                        flex: 1,
                                    }}
                                    type="button"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}