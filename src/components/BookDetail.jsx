import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function BookDetail({
                                       user,
                                       book,
                                       onBack,
                                       cambiarEstado,
                                       cambiarShelf,
                                       customShelves,
                                       borrarLibro,
                                       notes,
                                       notesLoading,
                                       noteText,
                                       setNoteText,
                                       noteChapter,
                                       setNoteChapter,
                                       noteQuote,
                                       setNoteQuote,
                                       crearNota,
                                       borrarNota,
                                       editingNoteId,
                                       editText,
                                       setEditText,
                                       editChapter,
                                       setEditChapter,
                                       editQuote,
                                       setEditQuote,
                                       empezarEditarNota,
                                       cancelarEditarNota,
                                       guardarEdicionNota,
                                       reviewText,
                                       setReviewText,
                                       reviewRating,
                                       setReviewRating,
                                       reviewLoading,
                                       guardarReview,
                                       compartirReviewAnonima,
                                       cargarResenasPublicas,
                                       publicReviews,
                                       publicReviewsLoading,
                                       cargarReview,
                                       reviewIsPublic,
                                       setReviewIsPublic,
                                       setReviewIsAnonymous,
                                       myReview,
                                       toggleBookShelf,
                                       noteMood,
                                       setNoteMood,
                                       editMood,
                                       setEditMood,
                                       addFromPreview,
                                   }) {
    // definimos el estilo
    // colores:
    const ACCENT = "#2F2A24"; // color principal
    const SOFT = "#F6F3EF"; // fondo suave
    const CARD = "#FFFFFF";
    const BORDER = "#E9E4DE";
    const MUTED = "rgba(47,42,36,0.60)"; // texto secundario

    const [openPanel, setOpenPanel] = useState(null); // review, diary o null (ver que sección está abierta -> ahora por defecto todas cerradas)
    // estados para sinopsis
    const [synopsis, setSynopsis] = useState("");
    const [synopsisLoading, setSynopsisLoading] = useState(false);
    // estados para info de autor
    const [authorOpen, setAuthorOpen] = useState(false);
    const [authorLoading, setAuthorLoading] = useState(false);
    const [authorBio, setAuthorBio] = useState("");
    const [authorPhoto, setAuthorPhoto] = useState("");
    const [authorName, setAuthorName] = useState(book.author || "");
    // keys resueltas en cliente (para libros que ya había guardado sin keys)
    const [resolvedWorkKey, setResolvedWorkKey] = useState("");
    const [resolvedAuthorKey, setResolvedAuthorKey] = useState("");
    // relectura
    const [readCount, setReadCount] = useState(
        Number.isFinite(book?.readCount) ? book.readCount : 0
    );
    const [rereadOpen, setRereadOpen] = useState(false);
    const [rereadDraft, setRereadDraft] = useState(readCount);

    // moods (igual que en Diary)
    const MOODS = ["", "relaxed", "thoughtful", "excited", "anxious", "romantic", "curious"];
    const moodLabel = (m) =>
        m === "relaxed" ? "relaxed" :
            m === "thoughtful" ? "thoughtful" :
                m === "excited" ? "excited" :
                    m === "anxious" ? "anxious" :
                        m === "romantic" ? "romantic" :
                            m === "curious" ? "curious" :
                                "—";
    // modo libro borrado (abierto desde Diary)
    const isDeleted = !!book?._deleted;
    const isDiscoverPreview = !!book?._discoverPreview;

    useEffect(() => {
        const rc = Number.isFinite(book?.readCount) ? book.readCount : 0;
        setReadCount(rc);
        setRereadDraft(rc);
    }, [book?.id, book?.readCount]);

    const inputStyle = {
        padding: 12,
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: SOFT,
        outline: "none", // quitamos focus azul
        width: "100%",
        boxSizing: "border-box",
        fontSize: 14,
    };
    // acción principal pantalla (guardar reseña, nota, buscar...)
    const primaryBtn = {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${ACCENT}`,
        background: ACCENT,
        color: "white",
        cursor: "pointer",
        width: "100%",
        fontWeight: 700,
    };
    // acciones secundarias (como ver reseñas, recargar, cancelar...)
    const ghostBtn = {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: CARD,
        color: ACCENT,
        cursor: "pointer",
        width: "100%",
        fontWeight: 700,
    };
    // para estados (want to read, reading, finished...)
    const pill = (active, disabled = false) => ({
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? ACCENT : CARD, // si está activo --> color principal
        color: active ? "white" : ACCENT,
        fontWeight: active ? 800 : 600,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 12,
        lineHeight: "16px",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.55 : 1,
    });
    // para encabezados de sección desplegables
    // al pulsar libro --> sección review, diary (abrir panel +; cerrar: -)
    const sectionHeader = (title, key) => (
        <button
            onClick={() => setOpenPanel((prev) => (prev === key ? null : key))}
            style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 12px",
                borderRadius: 16,
                border: `1px solid ${BORDER}`,
                background: CARD,
                cursor: "pointer",
                fontWeight: 800,
                color: ACCENT,
                opacity: isDeleted && (key === "review" || key === "diary") ? 0.6 : 1,
            }}
            type="button"
            disabled={isDeleted && (key === "review" || key === "diary")}
            title={isDeleted && (key === "review" || key === "diary") ? "This book is no longer in your library" : undefined}
        >
            <span>{title}</span>
            <span style={{ opacity: 0.7 }}>{openPanel === key ? "—" : "+"}</span>
        </button>
    );
    // evitar errores por diferencia en el formato JSON externo (para synopsis --> campo description API)
    function pickText(field) {
        if (!field) return "";
        if (typeof field === "string") return field;
        if (typeof field === "object" && typeof field.value === "string") return field.value;
        return "";
    }

    // cargar synopsis desde Open Library (works)
    // guardamos las keys
    const workKey = book?.openLibrary?.workKey || "";
    const authorKey = book?.openLibrary?.authorKey || "";
    const authorFromBook = book?.author || "";
    const titleFromBook = book?.title || "";

    // si libro no tiene keys --> extraer mediante búsqueda
    useEffect(() => {
        let alive = true;

        async function enrichIfMissing() {
            // reseteo cada vez que cambia el libro
            setResolvedWorkKey("");
            setResolvedAuthorKey("");

            if (!book?.id) return;
            if (workKey || authorKey) return;
            if (isDiscoverPreview) return;

            const q = `${titleFromBook} ${authorFromBook}`.trim();
            if (!q) return;

            try {
                const data = await api.searchOpenLibrary(q);
                const doc = data?.docs?.[0];
                if (!doc) return;

                const newWorkKey = typeof doc.key === "string" ? doc.key : "";
                const newAuthorKey =
                    Array.isArray(doc.author_key) && doc.author_key[0]
                        ? `/authors/${doc.author_key[0]}`
                        : "";

                if (!newWorkKey && !newAuthorKey) return;

                // para que se vea auto
                if (alive) {
                    setResolvedWorkKey(newWorkKey);
                    setResolvedAuthorKey(newAuthorKey);
                }

                // guardamos en Mongo para próximas veces
                if (user && !isDeleted) {
                    const token = await user.getIdToken();
                    await api.updateBook(token, book.id, {
                        openLibrary: { workKey: newWorkKey, authorKey: newAuthorKey },
                    });
                }
            } catch (e) {
            }
        }

        // si viene desde Diary y el libro está borrado, no intentamos guardar nada en Mongo
        if (!isDeleted) enrichIfMissing();

        // reseteamos autor
        setAuthorName(authorFromBook);
        setAuthorBio("");
        setAuthorPhoto("");
        setAuthorOpen(false);
        setAuthorLoading(false);

        return () => {
            alive = false;
        };
    }, [book?.id, workKey, authorKey, authorFromBook, titleFromBook, user, isDeleted, isDiscoverPreview]);

    // cargar synopsis desde Open Library (works)
    useEffect(() => {
        let alive = true;

        async function loadSynopsis() {
            setSynopsis("");
            const wk = resolvedWorkKey || workKey;
            if (!wk) return;

            setSynopsisLoading(true);
            try {
                const work = await api.getOpenLibraryWork(wk);
                const desc = pickText(work?.description);
                if (alive) setSynopsis(desc || "");
            } catch (e) {
                if (alive) setSynopsis("");
            } finally {
                if (alive) setSynopsisLoading(false);
            }
        }

        loadSynopsis();

        return () => {
            alive = false;
        };
    }, [resolvedWorkKey, workKey]);

    // abrir modal autor y cargar bio/foto
    const openAuthor = async () => {
        setAuthorOpen(true);

        // si ya lo tenemos cargado, no recargamos
        if (authorBio || authorPhoto) return;

        const ak = resolvedAuthorKey || book?.openLibrary?.authorKey;
        if (!ak) {
            setAuthorBio("There is no saved authorKey for this book (it does not come from Open Library).");
            return;
        }

        setAuthorLoading(true);
        try {
            const a = await api.getOpenLibraryAuthor(ak);
            setAuthorName(a?.name || book?.author || "");
            setAuthorBio(pickText(a?.bio) || "No biography available.");
            if (Array.isArray(a?.photos) && a.photos[0]) {
                setAuthorPhoto(`https://covers.openlibrary.org/a/id/${a.photos[0]}-L.jpg`);
            }
        } catch (e) {
            setAuthorBio("Could not load the author's biography.");
        } finally {
            setAuthorLoading(false);
        }
    };

    const guardarRelecturas = async () => {
        try {
            if (!user) return;
            if (isDeleted || isDiscoverPreview) return;

            const token = await user.getIdToken();

            const safe = Math.max(0, Math.floor(Number(rereadDraft) || 0));

            await api.patchBook(token, book.id, { readCount: safe });
            // actualizar UI
            setReadCount(safe);
            setRereadOpen(false);
        } catch (e) {
            alert(e.message || "Error saving rereads");
        }
    };

    const handleToggleStatus = async (statusKey) => {
        if (isDeleted) return;

        if (isDiscoverPreview) {
            const nextStatus = book.status === statusKey ? "" : statusKey;
            await addFromPreview(book, { status: nextStatus });
            return;
        }

        const nextStatus = book.status === statusKey ? "" : statusKey;
        await cambiarEstado(book.id, nextStatus);
    };

    const handleToggleShelf = async (shelfName) => {
        if (isDeleted) return;

        if (isDiscoverPreview) {
            await addFromPreview(book, { shelves: [shelfName] });
            return;
        }

        await toggleBookShelf(book.id, shelfName);
    };

    return (
        <div style={{ background: "#FBFAF8", minHeight: "100vh" }}>
            {" "}
            {/* vh -> ocupa al menos toda la altura de la ventana */}
            {/* header fijo */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10, //por encima del contenido al hacer scroll
                    background: "#FBFAF8",
                    borderBottom: `1px solid ${BORDER}`,
                }}
            >
                <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button
                            onClick={onBack}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 999,
                                border: `1px solid ${BORDER}`,
                                background: CARD,
                                cursor: "pointer",
                                fontWeight: 900,
                                color: ACCENT,
                            }}
                            type="button"
                            aria-label="Back"
                            title="Back"
                        >
                            ←
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                            {/* hacemos la portada mini */}
                            {book.cover?.url ? (
                                <img
                                    src={book.cover.url}
                                    alt={book.title}
                                    style={{
                                        width: 44,
                                        height: 66,
                                        objectFit: "cover",
                                        borderRadius: 10,
                                        border: `1px solid ${BORDER}`,
                                        flexShrink: 0, // para que no se comprima en pantallas pequeñas
                                    }}
                                />
                            ) : (
                                /* cuando no hay imagen de portada: */
                                <div
                                    style={{
                                        width: 44,
                                        height: 66,
                                        background: SOFT,
                                        borderRadius: 10,
                                        border: `1px solid ${BORDER}`,
                                        flexShrink: 0,
                                    }}
                                />
                            )}

                            <div style={{ minWidth: 0 }}>
                                {/* contenedor titulo y autor */}
                                <div
                                    style={{
                                        fontWeight: 900,
                                        color: ACCENT,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis", // recorte auto con ...
                                        whiteSpace: "nowrap", // una sola linea
                                    }}
                                >
                                    {book.title}
                                </div>

                                {/* autor clicable */}
                                <button
                                    type="button"
                                    onClick={openAuthor}
                                    style={{
                                        marginTop: 2,
                                        fontSize: 12,
                                        color: ACCENT,
                                        background: "transparent",
                                        border: "none",
                                        padding: 0,
                                        cursor: "pointer",
                                        textAlign: "left",
                                        textDecoration: "underline",
                                        textUnderlineOffset: 3,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                    title="View author info"
                                >
                                    {book.author} <span style={{ fontSize: 12, opacity: 0.8 }}>↗</span>
                                </button>

                            </div>
                        </div>
                    </div>

                    {isDeleted && (
                        <div
                            style={{
                                marginTop: 10,
                                border: `1px solid ${BORDER}`,
                                borderRadius: 16,
                                background: SOFT,
                                padding: 12,
                                color: ACCENT,
                                fontSize: 13,
                                fontWeight: 700,
                            }}
                        >
                            This book is no longer in your library. It is shown only as a reference from your notes.
                        </div>
                    )}

                    {isDiscoverPreview && (
                        <div
                            style={{
                                marginTop: 10,
                                border: `1px solid ${BORDER}`,
                                borderRadius: 16,
                                background: SOFT,
                                padding: 12,
                                color: ACCENT,
                                fontSize: 13,
                                fontWeight: 700,
                            }}
                        >
                            You found this book through a public review. You can explore it and add it to your library.
                        </div>
                    )}
                </div>
            </div>
            <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
                {/* bloque info */}
                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 18,
                        background: CARD,
                        padding: 14,
                    }}
                >
                    <div style={{ display: "flex", gap: 14 }}>
                        {/* portada a la izquierda */}
                        <div style={{ position: "relative", width: 96, height: 144, flexShrink: 0 }}>
                            {book.cover?.url ? (
                                <img
                                    src={book.cover.url}
                                    alt={book.title}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: 14,
                                        border: `1px solid ${BORDER}`,
                                    }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        background: SOFT,
                                        borderRadius: 14,
                                        border: `1px solid ${BORDER}`,
                                    }}
                                />
                            )}

                            {/* botón relectura */}
                            <button
                                type="button"
                                onClick={() => !isDeleted && !isDiscoverPreview && setRereadOpen(true)}
                                title={
                                    isDeleted
                                        ? "Unavailable (deleted book)"
                                        : isDiscoverPreview
                                            ? "Unavailable in preview mode"
                                            : "Edit rereads"
                                }
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    borderRadius: 999,
                                    border: `1px solid ${BORDER}`,
                                    background: "rgba(255,255,255,0.92)",
                                    padding: "6px 10px",
                                    fontWeight: 900,
                                    cursor: isDeleted || isDiscoverPreview ? "not-allowed" : "pointer",
                                    color: ACCENT,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    opacity: isDeleted || isDiscoverPreview ? 0.55 : 1,
                                }}
                                disabled={isDeleted || isDiscoverPreview}
                            >
                                <span>↻</span>
                                {readCount > 0 && <span>{readCount}</span>}
                            </button>

                        </div>

                        {/* info a la derecha */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, marginBottom: 8 }}>Status</div>

                            {/* status en chips */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus("to_read")}
                                    style={pill(book.status === "to_read", isDeleted)}
                                    disabled={isDeleted}
                                    title={isDeleted ? "Unavailable (deleted book)" : undefined}
                                >
                                    Want to read
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus("reading")}
                                    style={pill(book.status === "reading", isDeleted)}
                                    disabled={isDeleted}
                                    title={isDeleted ? "Unavailable (deleted book)" : undefined}
                                >
                                    Currently reading
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus("paused")}
                                    style={pill(book.status === "paused", isDeleted)}
                                    disabled={isDeleted}
                                    title={isDeleted ? "Unavailable (deleted book)" : undefined}
                                >
                                    Interrupted
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleStatus("finished")}
                                    style={pill(book.status === "finished", isDeleted)}
                                    disabled={isDeleted}
                                    title={isDeleted ? "Unavailable (deleted book)" : undefined}
                                >
                                    Finished
                                </button>
                            </div>

                            {customShelves.length > 0 && (
                                // estanterias personalizadas -> selección múltiple
                                <div style={{ marginTop: 14, opacity: isDeleted ? 0.6 : 1 }}>
                                    <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, marginBottom: 8 }}>Add to...</div>

                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {customShelves.map((s) => {
                                            // si el libro ya pertenece a esa estantería -> estado activo
                                            const active = Array.isArray(book.shelves) && book.shelves.includes(s);
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => !isDeleted && handleToggleShelf(s)}
                                                    style={{
                                                        padding: "8px 10px",
                                                        borderRadius: 999,
                                                        border: `1px solid ${active ? ACCENT : BORDER}`,
                                                        background: active ? SOFT : CARD,
                                                        fontWeight: active ? 900 : 700,
                                                        cursor: isDeleted ? "not-allowed" : "pointer",
                                                        color: ACCENT,
                                                        fontSize: 12,
                                                        opacity: isDeleted ? 0.55 : 1,
                                                    }}
                                                    type="button"
                                                    disabled={isDeleted}
                                                    title={isDeleted ? "Unavailable (deleted book)" : (active ? "Remove from this shelf" : "Add to this shelf")} // para hover/lector pantalla
                                                >
                                                    {s}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {!isDiscoverPreview && (
                                <div style={{ marginTop: 14 }}>
                                    <button
                                        onClick={() => !isDeleted && borrarLibro(book.id)}
                                        style={{
                                            padding: "12px 14px",
                                            borderRadius: 14,
                                            border: `1px solid ${BORDER}`,
                                            background: CARD,
                                            cursor: isDeleted ? "not-allowed" : "pointer",
                                            width: "100%",
                                            fontWeight: 900,
                                            color: ACCENT,
                                            opacity: isDeleted ? 0.55 : 1,
                                        }}
                                        type="button"
                                        disabled={isDeleted}
                                        title={isDeleted ? "Unavailable (deleted book)" : undefined}
                                    >
                                        🗑️ Delete book
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* synopsis */}
                <div style={{ marginTop: 14 }}>
                    <div
                        style={{
                            border: `1px solid ${BORDER}`,
                            borderRadius: 18,
                            background: CARD,
                            padding: 14,
                        }}
                    >
                        <div style={{ fontWeight: 900, color: ACCENT, marginBottom: 8 }}>Synopsis</div>

                        {synopsisLoading ? (
                            <div style={{ fontSize: 13, color: MUTED }}>Loading synopsis...</div>
                        ) : synopsis ? (
                            <div style={{ fontSize: 13, color: ACCENT, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{synopsis}</div>
                        ) : (
                            <div style={{ fontSize: 13, color: MUTED }}>
                                No synopsis was found for this book.
                            </div>
                        )}
                    </div>
                </div>

                {/* review --> sección desplegable */}
                {!isDeleted && !isDiscoverPreview && (
                    <div style={{ marginTop: 14 }}>
                        {sectionHeader("Review", "review")}
                        {openPanel === "review" && (
                            // controlamos si está abierto o no
                            <div
                                style={{
                                    marginTop: 10,
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 18,
                                    background: CARD,
                                    padding: 14,
                                }}
                            >
                                <div style={{ display: "grid", gap: 10 }}>
                                    <select
                                        value={reviewRating} // guardamos el score
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
                                        style={{ ...inputStyle, resize: "vertical" }} // agrandamos solo en vertical
                                    />

                                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                        <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, minWidth: 120 }}>Mode:</div>

                                        <button
                                            onClick={() => {
                                                // modo privado
                                                // (no cambia tu reseña, solo el modo de guardado)
                                                setReviewIsPublic(false);
                                                setReviewIsAnonymous(true);
                                            }}
                                            // ahora tipo pill
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
                                                // modo publico anonimo
                                                setReviewIsPublic(true);
                                                setReviewIsAnonymous(true);
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
                                        onClick={() => guardarReview(book.id, { isPublic: reviewIsPublic, isAnonymous: true })}
                                        style={primaryBtn}
                                        disabled={reviewLoading}
                                        type="button"
                                    >
                                        {reviewLoading ? "Saving..." : reviewIsPublic ? "Save and publish anonymously" : "Save review (private)"}
                                    </button>

                                    <div style={{ fontSize: 12, color: MUTED }}>
                                        Current status:{" "}
                                        <strong style={{ color: ACCENT }}>{reviewIsPublic ? "Published (anonymous)" : "Private"}</strong>
                                    </div>

                                    {/* TU RESEÑA GUARDADA (solo tú) */}
                                    {myReview && myReview.text ? (
                                        <div
                                            style={{
                                                border: `1px solid ${BORDER}`,
                                                borderRadius: 16,
                                                padding: 12,
                                                background: SOFT,
                                            }}
                                        >
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                                <div style={{ fontWeight: 900, color: ACCENT }}>Your saved review</div>
                                                <div style={{ fontSize: 12, color: MUTED }}>⭐ {myReview.rating || "?"}/5</div>
                                            </div>

                                            <div style={{ marginTop: 8, whiteSpace: "pre-wrap", color: ACCENT }}>{myReview.text}</div>

                                            <div style={{ marginTop: 8, fontSize: 12, color: MUTED }}>
                                                {myReview.isPublic ? "It is also published (anonymous)" : "It is not published"}
                                            </div>

                                            {myReview.updatedAt && (
                                                <div style={{ marginTop: 6, fontSize: 11, color: MUTED }}>
                                                    Last updated: {new Date(myReview.updatedAt).toLocaleString()}
                                                </div>
                                            )}

                                            <button
                                                onClick={() => cargarReview(book.id)}
                                                style={{ ...ghostBtn, marginTop: 10 }}
                                                disabled={reviewLoading}
                                                type="button"
                                            >
                                                {reviewLoading ? "Loading..." : "Reload my review"}
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: 12, color: MUTED }}>You have not saved a private review for this book yet.</div>
                                    )}

                                    <button onClick={() => cargarResenasPublicas(book.id)} style={ghostBtn} type="button">
                                        See anonymous reviews from others
                                    </button>

                                    {publicReviewsLoading ? (
                                        <p style={{ opacity: 0.7, margin: 0 }}>Loading reviews...</p>
                                    ) : publicReviews.length === 0 ? (
                                        // si no hay resultados
                                        <p style={{ opacity: 0.7, margin: 0 }}>There are no public reviews for this book yet.</p>
                                    ) : (
                                        <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
                                            {publicReviews.map((r) => (
                                                <div
                                                    key={r.id}
                                                    style={{
                                                        border: `1px solid ${BORDER}`,
                                                        borderRadius: 16,
                                                        padding: 12,
                                                        background: CARD,
                                                    }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                                        <div style={{ fontWeight: 900, color: ACCENT }}>{r.authorLabel || "Anonymous"}</div>
                                                        <div style={{ fontSize: 12, color: MUTED }}>⭐ {r.rating || "?"}/5</div>
                                                    </div>

                                                    <div style={{ marginTop: 8, whiteSpace: "pre-wrap", color: ACCENT }}>{r.text}</div>

                                                    {r.createdAt && (
                                                        <div style={{ marginTop: 8, fontSize: 11, color: MUTED }}>
                                                            {new Date(r.createdAt).toLocaleString()}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* diary --> sección deplegable*/}
                {!isDeleted && !isDiscoverPreview && (
                    <div style={{ marginTop: 14 }}>
                        {sectionHeader("Diary", "diary")}
                        {openPanel === "diary" && (
                            <div
                                style={{
                                    marginTop: 10,
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 18,
                                    background: CARD,
                                    padding: 14,
                                }}
                            >
                                <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                                    {/* mood al crear la nota (opcional) */}
                                    <div style={{ display: "grid", gap: 6 }}>
                                        <select
                                            value={noteMood}
                                            onChange={(e) => setNoteMood(e.target.value)}
                                            style={{
                                                ...inputStyle,
                                                color: noteMood ? "#222" : MUTED,
                                            }}
                                            title="How do you feel while writing this note?"
                                        >
                                            {/* placeholder */}
                                            <option value="" style={{ color: MUTED }}>
                                                Mood (optional)
                                            </option>

                                            {/* moods reales */}
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

                                    <button onClick={() => crearNota(book.id)} style={primaryBtn} type="button">
                                        Save note
                                    </button>
                                </div>

                                {notesLoading ? (
                                    <p style={{ opacity: 0.7, margin: 0 }}>Loading notes...</p>
                                ) : notes.length === 0 ? (
                                    <p style={{ opacity: 0.7, margin: 0 }}>There are no notes for this book yet.</p>
                                ) : (
                                    <div style={{ display: "grid", gap: 10 }}>
                                        {notes.map((n) => (
                                            // cada nota se muestra como una tarjeta
                                            <div
                                                key={n.id}
                                                style={{
                                                    border: `1px solid ${BORDER}`,
                                                    borderRadius: 16,
                                                    padding: 12,
                                                    background: CARD,
                                                }}
                                            >
                                                {editingNoteId === n.id ? (
                                                    // si se está editando la nota --> mostrar como input
                                                    <div style={{ display: "grid", gap: 10 }}>
                                                        {/* mood al editar la nota (opcional) */}
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
                                                            rows={4}
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
                                                                onClick={() => guardarEdicionNota(n.id)}
                                                                style={{
                                                                    ...primaryBtn,
                                                                    width: "auto",
                                                                    flex: 1,
                                                                }}
                                                                type="button"
                                                            >
                                                                ✅ Save
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
                                                                ✖ Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* mostramos mood solo si existe */}
                                                        {typeof n.mood === "string" && n.mood.trim() && (
                                                            <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, marginBottom: 6 }}>
                                                                Mood: <span style={{ color: ACCENT }}>{moodLabel(n.mood)}</span>
                                                            </div>
                                                        )}

                                                        {n.chapter && (
                                                            <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, marginBottom: 6 }}>{n.chapter}</div>
                                                        )}

                                                        <div style={{ whiteSpace: "pre-wrap", color: ACCENT }}>{n.text}</div>

                                                        {n.quote && (
                                                            <div style={{ marginTop: 8, fontStyle: "italic", color: MUTED }}>
                                                                “{n.quote}”
                                                            </div>
                                                        )}

                                                        {n.createdAt && (
                                                            <div style={{ marginTop: 8, fontSize: 11, color: MUTED }}>
                                                                {new Date(n.createdAt).toLocaleString()}
                                                            </div>
                                                        )}

                                                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                                                            <button
                                                                onClick={() => empezarEditarNota(n)}
                                                                style={{
                                                                    ...ghostBtn,
                                                                    width: "auto",
                                                                    flex: 1,
                                                                }}
                                                                type="button"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => borrarNota(n.id)}
                                                                style={{
                                                                    ...ghostBtn,
                                                                    width: "auto",
                                                                    flex: 1,
                                                                }}
                                                                type="button"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* separador final para que no choque con bottom nav */}
                <div style={{ height: 84 }} />

                {/* modal autor */}
                {authorOpen && (
                    <div
                        onClick={() => setAuthorOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.35)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-end",
                            padding: 16,
                            zIndex: 50,
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
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <div style={{ fontWeight: 900, color: ACCENT }}>{authorName || "Author"}</div>
                                <button onClick={() => setAuthorOpen(false)} style={{ ...ghostBtn, width: "auto" }} type="button">
                                    Close
                                </button>
                            </div>

                            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                                {authorPhoto ? (
                                    <img
                                        src={authorPhoto}
                                        alt={authorName}
                                        style={{
                                            width: 84,
                                            height: 84,
                                            borderRadius: 16,
                                            objectFit: "cover",
                                            border: `1px solid ${BORDER}`,
                                            flexShrink: 0,
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: 84,
                                            height: 84,
                                            borderRadius: 16,
                                            background: SOFT,
                                            border: `1px solid ${BORDER}`,
                                            flexShrink: 0,
                                        }}
                                    />
                                )}

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {authorLoading ? (
                                        <div style={{ fontSize: 13, color: MUTED }}>Loading biography...</div>
                                    ) : (
                                        <div style={{ fontSize: 13, color: ACCENT, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                                            {authorBio || "No biography available."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* modal relecturas */}
            {rereadOpen && (
                <div
                    onClick={() => setRereadOpen(false)}
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
                            <div style={{ fontWeight: 900, color: ACCENT }}>Rereads</div>
                            <button onClick={() => setRereadOpen(false)} style={{ ...ghostBtn, width: "auto" }} type="button">
                                Close
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
                            <button
                                type="button"
                                onClick={() => setRereadDraft((v) => Math.max(0, (Number(v) || 0) - 1))}
                                style={{ ...ghostBtn, width: 44, padding: 10 }}
                                title="Subtract 1"
                            >
                                −
                            </button>

                            <input
                                type="number"
                                min={0}
                                value={rereadDraft}
                                onChange={(e) => setRereadDraft(e.target.value)}
                                style={{ ...inputStyle, textAlign: "center", fontWeight: 900 }}
                            />

                            <button
                                type="button"
                                onClick={() => setRereadDraft((v) => (Number(v) || 0) + 1)}
                                style={{ ...ghostBtn, width: 44, padding: 10 }}
                                title="Add 1"
                            >
                                +
                            </button>
                        </div>

                        <button onClick={guardarRelecturas} style={{ ...primaryBtn, marginTop: 12 }} type="button">
                            Save
                        </button>

                    </div>
                </div>
            )}

        </div>
    );
}