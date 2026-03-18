import { useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import { api } from "../services/api";
import DiaryListView from "../components/DiaryListView";
import AICompanionModal from "../components/AICompanionModal";

export default function Diary({ books, setSelectedBook, styles }) {
    const { ACCENT, SOFT, CARD, BORDER, MUTED } = styles;

    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState([]);
    const [reviews, setReviews] = useState([]);

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

    // mood de la nueva nota (opcional)
    const [noteMood, setNoteMood] = useState("");

    // editar nota
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

    // modal ver todas
    const [listViewOpen, setListViewOpen] = useState(false);
    const [listViewType, setListViewType] = useState("notes");

    // modal AI companion
    const [companionModalOpen, setCompanionModalOpen] = useState(false);

    // map para resolver bookId --> info libro
    const bookById = useMemo(() => {
        const m = new Map();
        (Array.isArray(books) ? books : []).forEach((b) => m.set(String(b.id), b));
        return m;
    }, [books]);

    // carga de notas y reviews
    const load = useCallback(async () => {
        try {
            setLoading(true);
            const token = await auth.currentUser.getIdToken();

            const [notesData, reviewsData] = await Promise.all([
                api.listAllNotes(token, { limit: 300 }),
                api.getMyReviews(token),
            ]);

            setNotes(Array.isArray(notesData) ? notesData : []);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
        } catch (e) {
            alert(e.message || "Error loading the Diary");
            setNotes([]);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // cargamos
    useEffect(() => {
        load();
    }, [load]);

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

    // para estados vacíos
    const renderEmpty = (text) => (
        <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.45 }}>
            {text}
        </div>
    );

    // preparar modal para crear nueva entrada
    const openNewEntry = () => {
        const fallback = Array.isArray(books) && books[0]?.id ? String(books[0].id) : "";
        setDraftBookId(fallback);

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

    // crear o nota o review
    const createEntry = async () => {
        try {
            if (!draftBookId) {
                alert("Select a book before saving the entry.");
                return;
            }

            setSaving(true);
            const token = await auth.currentUser.getIdToken();

            if (newType === "note") {
                if (!noteText.trim()) {
                    alert("Write your note before saving.");
                    return;
                }

                await api.createNote(token, draftBookId, {
                    chapter: noteChapter || "",
                    text: noteText.trim(),
                    quote: noteQuote || "",
                    mood: noteMood || "",
                });

                setNewOpen(false);
                setNoteChapter("");
                setNoteText("");
                setNoteQuote("");
                setNoteMood("");
                await load();
                return;
            }

            // crear review
            if (!reviewText.trim()) {
                alert("Write your review before saving.");
                return;
            }

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
            alert(e.message || "Error saving the entry");
        } finally {
            setSaving(false);
        }
    };

    // modal edición
    const empezarEditarNota = (n) => {
        setEditingNoteId(n.id);
        setEditText(n.text || "");
        setEditChapter(n.chapter || "");
        setEditQuote(n.quote || "");
        setEditMood(n.mood || "");
        setEditOpen(true);
    };

    // cerrar y limpiar modal edición
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
                alert("Write your note before saving.");
                return;
            }

            const token = await auth.currentUser.getIdToken();

            await api.patchNote(token, noteId, {
                chapter: editChapter || "",
                text: editText.trim(),
                quote: editQuote || "",
                mood: editMood || "",
            });

            // eliminar posible borrador
            setDraftAnswers((prev) => {
                const next = { ...prev };
                delete next[noteId];
                return next;
            });

            cancelarEditarNota();
            await load();
        } catch (e) {
            alert(e.message || "Error saving the edit");
        }
    };

    const borrarNota = async (noteId) => {
        try {
            if (!noteId) return;

            const ok = window.confirm("Are you sure you want to delete this note?");
            if (!ok) return;

            const token = await auth.currentUser.getIdToken();
            await api.deleteNote(token, noteId);

            setDraftAnswers((prev) => {
                const next = { ...prev };
                delete next[noteId];
                return next;
            });

            await load();
        } catch (e) {
            alert(e.message || "Error deleting the note");
        }
    };

    // crea reflexión por IA
    const reflectNote = async (n) => {
        try {
            if (!n?.id) return;

            setAiLoadingId(n.id);
            const token = await auth.currentUser.getIdToken();

            if (!Array.isArray(n.aiCompanion?.questions) || n.aiCompanion.questions.length === 0) {
                await api.generateNoteCompanion(token, n.id);
                await load();
            }
        } catch (e) {
            alert(e.message || "Error generating the reflection");
        } finally {
            setAiLoadingId(null);
        }
    };

    // respuestas: prioriza borrador no guardado
    const getAnswersForNote = useCallback((n) => {
        const fromDraft = draftAnswers[n.id];
        if (Array.isArray(fromDraft)) return fromDraft;

        const saved = Array.isArray(n.aiCompanion?.answers) ? n.aiCompanion.answers : [];
        return [
            saved[0] || "",
            saved[1] || "",
            saved[2] || "",
        ];
    }, [draftAnswers]);

    // actualizar respuesta en el borrador local
    const updateDraftAnswer = (noteId, idx, value, noteObj) => {
        setDraftAnswers((prev) => {
            const current = Array.isArray(prev[noteId])
                ? prev[noteId]
                : [
                    noteObj?.aiCompanion?.answers?.[0] || "",
                    noteObj?.aiCompanion?.answers?.[1] || "",
                    noteObj?.aiCompanion?.answers?.[2] || "",
                ];
            const next = [...current];
            next[idx] = value;
            return {
                ...prev,
                [noteId]: next,
            };
        });
    };

    // guardar en backend respuestas de AICompanion
    const saveCompanionAnswers = async (noteId, noteObj) => {
        try {
            if (!noteId) return;

            setSavingAnswersId(noteId);
            const token = await auth.currentUser.getIdToken();
            const answers = getAnswersForNote(noteObj);

            await api.updateNoteCompanion(token, noteId, {
                answers,
            });

            await load();
        } catch (e) {
            alert(e.message || "Error saving the reflections");
        } finally {
            setSavingAnswersId(null);
        }
    };

    const getPreviewText = (n) => {
        const base = typeof n.text === "string" ? n.text.trim() : "";
        if (!base) return "";
        return base.length > 180 ? `${base.slice(0, 180)}…` : base;
    };

    // abrir detalle libro
    const openBook = (n) => {
        const b = bookById.get(String(n.bookId));

        const fallbackBook = {
            id: n.bookId,
            title: n.bookTitle || "Book",
            author: n.bookAuthor || "",
            cover: { url: n.bookCoverUrl || "" },
            status: "to_read",
            shelves: [],
            openLibrary: { workKey: "", authorKey: "" },
            readCount: 0,
            _deleted: true,
        };

        setSelectedBook(b || fallbackBook);
    };

    // separar notas y citas
    const notesOnly = useMemo(
        () => notes.filter((n) => !(typeof n.quote === "string" && n.quote.trim())),
        [notes]
    );
    const quotesOnly = useMemo(
        () => notes.filter((n) => typeof n.quote === "string" && n.quote.trim()),
        [notes]
    );

    // ordenadas por fecha
    const sortedNotes = useMemo(
        () => [...notesOnly].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)),
        [notesOnly]
    );
    const sortedQuotes = useMemo(
        () => [...quotesOnly].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)),
        [quotesOnly]
    );
    const sortedReviews = useMemo(
        () => [...reviews].sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)),
        [reviews]
    );

    const sectionCard = {
        background: CARD,
        border: `1px solid ${BORDER}`,
        borderRadius: 24,
        padding: 14,
    };

    // cabecera para cada bloque diary
    const sectionTitleRow = (title, subtitle, onViewAll = null) => (
        <div
            style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 12,
            }}
        >
            <div>
                <div style={{ fontWeight: 900, color: ACCENT, fontSize: 19 }}>{title}</div>
                <div style={{ marginTop: 4, color: MUTED, fontSize: 13 }}>{subtitle}</div>
            </div>

            {onViewAll && (
                <button
                    type="button"
                    onClick={onViewAll}
                    style={{
                        ...subtleBtn,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    View all
                </button>
            )}
        </div>
    );

    const renderNotePreview = (n) => {
        const b = bookById.get(String(n.bookId));
        const title = b?.title || n.bookTitle || "Book";
        const author = b?.author || n.bookAuthor || "";

        return (
            <button
                key={n.id}
                type="button"
                onClick={() => {
                    setListViewType("notes");
                    setListViewOpen(true);
                }}
                style={{
                    textAlign: "left",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 18,
                    background: CARD,
                    padding: 14,
                    cursor: "pointer",
                }}
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

                <div
                    style={{
                        marginTop: 10,
                        color: MUTED,
                        fontSize: 14,
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {getPreviewText(n)}
                </div>
            </button>
        );
    };

    // preview grande cita/frase
    const renderQuotePreview = (n, big = false) => {
        const b = bookById.get(String(n.bookId));
        const title = b?.title || n.bookTitle || "Book";

        return (
            <button
                key={n.id}
                type="button"
                onClick={() => {
                    setListViewType("quotes");
                    setListViewOpen(true);
                }}
                style={{
                    textAlign: "left",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 22,
                    background: SOFT,
                    padding: big ? 18 : 14,
                    cursor: "pointer",
                }}
            >
                <div style={{ color: MUTED, fontSize: 12, fontWeight: 800 }}>{title}</div>

                <div
                    style={{
                        marginTop: 10,
                        color: ACCENT,
                        fontSize: big ? 24 : 18,
                        lineHeight: 1.6,
                        fontWeight: 800,
                        display: "-webkit-box",
                        WebkitLineClamp: big ? 5 : 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    “{n.quote}”
                </div>
            </button>
        );
    };

    // preview review
    const renderReviewPreview = (r) => {
        const b = bookById.get(String(r.bookId));
        const resolvedTitle = b?.title || r.bookTitle || r.title || "Book";
        const resolvedAuthor = b?.author || r.bookAuthor || r.author || "";

        return (
            <button
                key={r.id}
                type="button"
                onClick={() => {
                    const existing = bookById.get(String(r.bookId));
                    if (existing) {
                        setSelectedBook(existing);
                        return;
                    }

                    setSelectedBook({
                        id: r.bookId,
                        title: resolvedTitle,
                        author: resolvedAuthor,
                        cover: { url: r.coverUrl || "" },
                        status: "to_read",
                        shelves: [],
                        openLibrary: { workKey: "", authorKey: "" },
                        readCount: 0,
                        _deleted: true,
                    });
                }}
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
                            {resolvedTitle}
                        </div>
                        {resolvedAuthor ? (
                            <div style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>{resolvedAuthor}</div>
                        ) : null}
                    </div>

                    <div style={{ fontSize: 12, color: ACCENT, fontWeight: 900 }}>
                        ⭐ {r.rating || "?"}/5
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 10,
                        color: ACCENT,
                        fontSize: 14,
                        lineHeight: 1.55,
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {r.text}
                </div>
            </button>
        );
    };

    return (
        <>
            {/* cabecera de la pantalla diary */}
            <div
                style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 24,
                    background: CARD,
                    padding: 18,
                }}
            >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                        <div style={{ fontWeight: 900, color: ACCENT, fontSize: 26, lineHeight: 1.1 }}>
                            Reading Diary
                        </div>
                        <div style={{ marginTop: 6, color: MUTED, fontSize: 14, lineHeight: 1.45 }}>
                            Your recent notes, quotes, reviews and reflections.
                        </div>
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
                            flexShrink: 0,
                        }}
                        title="Create new entry"
                    >
                        + New entry
                    </button>
                </div>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
                {/* bloque IA */}
                <div
                    style={{
                        background: SOFT,
                        border: `1px solid ${BORDER}`,
                        borderRadius: 24,
                        padding: 16,
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontWeight: 900, color: ACCENT, fontSize: 18 }}>
                        Is it the moment to do a reflection?
                    </div>

                    <div style={{ marginTop: 8, color: MUTED, fontSize: 14, lineHeight: 1.45 }}>
                        With AI, you can reflect more deeply on the books you read.
                    </div>

                    <div
                        style={{
                            marginTop: 14,
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setCompanionModalOpen(true)}
                            style={{
                                padding: "10px 16px",
                                borderRadius: 999,
                                border: `1px solid ${ACCENT}`,
                                background: CARD,
                                color: ACCENT,
                                cursor: "pointer",
                                fontWeight: 900,
                            }}
                        >
                            AI companion
                        </button>
                    </div>
                </div>

                {/* secciones: notas, citas, review */}
                <div>
                    <div style={{ marginBottom: 12, color: MUTED, fontSize: 14, fontWeight: 800 }}>
                        Your recent thoughts
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gap: 14,
                        }}
                    >
                        <div style={sectionCard}>
                            {sectionTitleRow(
                                "Notes",
                                () => {
                                    setListViewType("notes");
                                    setListViewOpen(true);
                                }
                            )}

                            {loading ? (
                                <div style={{ opacity: 0.7 }}>Loading entries...</div>
                            ) : sortedNotes.length === 0 ? (
                                renderEmpty("There are no notes yet.")
                            ) : (
                                <div style={{ display: "grid", gap: 10 }}>
                                    {sortedNotes.slice(0, 1).map((n) => renderNotePreview(n))}
                                </div>
                            )}
                        </div>

                        <div style={sectionCard}>
                            {sectionTitleRow(
                                "Quotes",
                                () => {
                                    setListViewType("quotes");
                                    setListViewOpen(true);
                                }
                            )}

                            {loading ? (
                                <div style={{ opacity: 0.7 }}>Loading entries...</div>
                            ) : sortedQuotes.length === 0 ? (
                                renderEmpty("There are no highlighted quotes yet.")
                            ) : (
                                <div style={{ display: "grid", gap: 10 }}>
                                    {sortedQuotes.slice(0, 1).map((n) => renderQuotePreview(n, true))}
                                </div>
                            )}
                        </div>

                        <div style={sectionCard}>
                            {sectionTitleRow(
                                "Reviews",
                                () => {
                                    setListViewType("reviews");
                                    setListViewOpen(true);
                                }
                            )}

                            {loading ? (
                                <div style={{ opacity: 0.7 }}>Loading entries...</div>
                            ) : sortedReviews.length === 0 ? (
                                renderEmpty("You have not written any reviews yet.")
                            ) : (
                                <div style={{ display: "grid", gap: 10 }}>
                                    {sortedReviews.slice(0, 1).map((r) => renderReviewPreview(r))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* modal para listar todas notas, reviews, citas */}
            {listViewOpen && (
                <DiaryListView
                    type={listViewType}
                    books={books}
                    setSelectedBook={setSelectedBook}
                    styles={styles}
                    onClose={() => setListViewOpen(false)}
                    notes={notes}
                    reviews={reviews}
                    openBook={openBook}
                    empezarEditarNota={empezarEditarNota}
                    borrarNota={borrarNota}
                    moodLabel={moodLabel}
                    getPreviewText={getPreviewText}
                />
            )}

            {/* modal IA */}
            {companionModalOpen && (
                <AICompanionModal
                    notes={notes}
                    books={books}
                    styles={styles}
                    onClose={() => setCompanionModalOpen(false)}
                    getAnswersForNote={getAnswersForNote}
                    reflectNote={reflectNote}
                    aiLoadingId={aiLoadingId}
                    saveCompanionAnswers={saveCompanionAnswers}
                    savingAnswersId={savingAnswersId}
                    updateDraftAnswer={updateDraftAnswer}
                    moodLabel={moodLabel}
                />
            )}

            {/* modal crear nueva entrada */}
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
                                Close
                            </button>
                        </div>

                        {/* seleccionar nota o review */}
                        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button type="button" onClick={() => setNewType("note")} style={pill(newType === "note")}>
                                Note
                            </button>
                            <button type="button" onClick={() => setNewType("review")} style={pill(newType === "review")}>
                                Review
                            </button>
                        </div>

                        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                            {/* seleccionar libro */}
                            <select
                                value={draftBookId}
                                onChange={(e) => setDraftBookId(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="">Select a book</option>
                                {(Array.isArray(books) ? books : []).map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.title || "Untitled"}
                                    </option>
                                ))}
                            </select>

                            {/* crear nota */}
                            {newType === "note" ? (
                                <>
                                    <div style={{ display: "grid", gap: 6 }}>
                                        <div style={{ fontSize: 12, color: MUTED, fontWeight: 800 }}>
                                            Mood (optional)
                                        </div>
                                        <select
                                            value={noteMood}
                                            onChange={(e) => setNoteMood(e.target.value)}
                                            style={inputStyle}
                                            title="How do you feel while writing this note?"
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
                                        placeholder="Chapter / part (optional)"
                                        value={noteChapter}
                                        onChange={(e) => setNoteChapter(e.target.value)}
                                        style={inputStyle}
                                    />

                                    <textarea
                                        placeholder="Write your note..."
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        rows={4}
                                        style={{ ...inputStyle, resize: "vertical" }}
                                    />

                                    <input
                                        placeholder="Highlighted quote (optional)"
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
                                        {saving ? "Saving..." : "Save note"}
                                    </button>
                                </>
                            ) : (
                                // crear review
                                <>
                                    <select
                                        value={reviewRating}
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
                                        placeholder="Write your review of the book..."
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        rows={4}
                                        style={{ ...inputStyle, resize: "vertical" }}
                                    />

                                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                        <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, minWidth: 120 }}>Mode:</div>

                                        <button
                                            onClick={() => {
                                                setReviewIsPublic(false);
                                            }}
                                            style={{
                                                ...pill(!reviewIsPublic),
                                                border: `1px solid ${!reviewIsPublic ? ACCENT : BORDER}`,
                                            }}
                                            type="button"
                                        >
                                            Just for me
                                        </button>

                                        <button
                                            onClick={() => {
                                                setReviewIsPublic(true);
                                            }}
                                            style={{
                                                ...pill(!!reviewIsPublic),
                                                border: `1px solid ${reviewIsPublic ? ACCENT : BORDER}`,
                                            }}
                                            type="button"
                                            title="Publish your review without showing your identity"
                                        >
                                            Publish anonymously
                                        </button>
                                    </div>

                                    <button
                                        onClick={createEntry}
                                        style={primaryBtn}
                                        type="button"
                                        disabled={saving}
                                    >
                                        {saving ? "Saving..." : reviewIsPublic ? "Save and publish anonymously" : "Save review (private)"}
                                    </button>

                                    <div style={{ fontSize: 12, color: MUTED }}>
                                        Current status:{" "}
                                        <strong style={{ color: ACCENT }}>{reviewIsPublic ? "Published (anonymous)" : "Private"}</strong>
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
                                Close
                            </button>
                        </div>

                        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontSize: 12, color: MUTED, fontWeight: 800 }}>
                                    Mood (optional)
                                </div>
                                <select
                                    value={editMood}
                                    onChange={(e) => setEditMood(e.target.value)}
                                    style={inputStyle}
                                    title="Update note mood"
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
                                placeholder="Chapter / part (optional)"
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
                                placeholder="Highlighted quote (optional)"
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