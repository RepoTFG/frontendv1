import { useMemo, useState } from "react";

export default function DiaryListView({
                                          type,
                                          books,
                                          setSelectedBook,
                                          styles,
                                          onClose,
                                          notes,
                                          reviews,
                                          openBook,
                                          empezarEditarNota,
                                          borrarNota,
                                          moodLabel,
                                          getPreviewText,
                                      }) {
    const { ACCENT, SOFT, CARD, BORDER, MUTED } = styles;
    // texto del buscador
    const [q, setQ] = useState("");
    const [bookId, setBookId] = useState("");
    const [menuOpenId, setMenuOpenId] = useState(null);

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
    // para el botón (...)
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
    // buscar libros por id
    const bookById = useMemo(() => {
        const m = new Map();
        (Array.isArray(books) ? books : []).forEach((b) => m.set(String(b.id), b));
        return m;
    }, [books]);
    // separar notas y citas
    const notesOnly = useMemo(
        () => notes.filter((n) => !(typeof n.quote === "string" && n.quote.trim())),
        [notes]
    );
    const quotesOnly = useMemo(
        () => notes.filter((n) => typeof n.quote === "string" && n.quote.trim()),
        [notes]
    );
    // según modal --> mostrar un dataset o otro
    const source = useMemo(() => {
        if (type === "quotes") return quotesOnly;
        if (type === "reviews") return reviews;
        return notesOnly;
    }, [type, notesOnly, quotesOnly, reviews]);

    // filtro de texto y libro
    const filteredItems = useMemo(() => {
        const query = q.trim().toLowerCase();

        return source.filter((item) => {
            const itemBookId = String(item.bookId || "");
            if (bookId && itemBookId !== String(bookId)) return false;

            if (!query) return true;

            const text =
                type === "reviews"
                    ? [
                        item.title,
                        item.bookTitle,
                        item.author,
                        item.bookAuthor,
                        item.text,
                    ].filter(Boolean).join(" ").toLowerCase()
                    : [
                        item.bookTitle,
                        item.bookAuthor,
                        item.chapter,
                        item.text,
                        item.quote,
                    ].filter(Boolean).join(" ").toLowerCase();

            return text.includes(query);
        });
    }, [source, q, bookId, type]);
    // cambiamos título según contenido
    const getTitle = () => {
        if (type === "quotes") return "All quotes";
        if (type === "reviews") return "All reviews";
        return "All notes";
    };
    // review
    const renderReviewCard = (r) => {
        const b = bookById.get(String(r.bookId));
        const resolvedTitle = b?.title || r.bookTitle || r.title || "Libro";
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
                    // fallback si libro ya no existe en la estantería
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
                    borderRadius: 20,
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

                    <div
                        style={{
                            fontSize: 12,
                            color: ACCENT,
                            whiteSpace: "nowrap",
                            fontWeight: 900,
                            border: `1px solid ${BORDER}`,
                            borderRadius: 999,
                            padding: "6px 8px",
                            background: SOFT,
                        }}
                    >
                        ⭐ {r.rating || "?"}/5
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 12,
                        color: ACCENT,
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                    }}
                >
                    {r.text}
                </div>
            </button>
        );
    };
    // nota o cita
    const renderNoteCard = (n, mode = "note") => {
        const b = bookById.get(String(n.bookId));
        const title = b?.title || n.bookTitle || "Libro";
        const author = b?.author || n.bookAuthor || "";

        return (
            <div
                key={`${mode}-${n.id}`}
                style={{
                    textAlign: "left",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 20,
                    background: mode === "quote" ? SOFT : CARD,
                    padding: 14,
                }}
            >
                {/* título y menú opciones */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
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
                    </div>
                    {/* botón menú */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                        <button
                            type="button"
                            onClick={() => setMenuOpenId((prev) => prev === n.id ? null : n.id)}
                            style={menuBtn}
                            title="Más opciones"
                        >
                            ⋯
                        </button>
                        {/* menú abierto --> acciones */}
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
                {/* mood solo notas, no para citas */}
                {typeof n.mood === "string" && n.mood.trim() && mode === "note" && (
                    <div style={{ marginTop: 12, fontSize: 12, color: MUTED, fontWeight: 800 }}>
                        Mood · <span style={{ color: ACCENT }}>{moodLabel(n.mood)}</span>
                    </div>
                )}
                {/* cita: quote; si no, preview texto */}
                {mode === "quote" ? (
                    <div
                        style={{
                            marginTop: 12,
                            color: ACCENT,
                            fontSize: 22,
                            lineHeight: 1.55,
                            fontWeight: 800,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        “{n.quote}”
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 10,
                            color: MUTED,
                            fontSize: 14,
                            lineHeight: 1.55,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {getPreviewText(n)}
                    </div>
                )}
            </div>
        );
    };

    return (
        // fondo modal
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                padding: 16,
                zIndex: 80,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: 520,
                    maxHeight: "88vh",
                    overflow: "auto",
                    borderRadius: 24,
                    border: `1px solid ${BORDER}`,
                    background: CARD,
                    padding: 14,
                }}
            >
                {/* cabecera */}
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <div style={{ fontWeight: 900, color: ACCENT, fontSize: 20 }}>{getTitle()}</div>
                    <button type="button" onClick={onClose} style={subtleBtn}>
                        Close
                    </button>
                </div>
                {/* filtros */}
                <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar palabra, cita o texto"
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
                {/* resultados */}
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                    {filteredItems.length === 0 ? (
                        <div style={{ color: MUTED, fontSize: 13 }}>
                            No hay entradas para mostrar.
                        </div>
                    ) : type === "reviews" ? (
                        filteredItems.map((r) => renderReviewCard(r))
                    ) : type === "quotes" ? (
                        filteredItems.map((n) => renderNoteCard(n, "quote"))
                    ) : (
                        filteredItems.map((n) => renderNoteCard(n, "note"))
                    )}
                </div>
            </div>
        </div>
    );
}