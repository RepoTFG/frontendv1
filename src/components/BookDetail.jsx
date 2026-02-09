import { useState } from "react";

export default function BookDetail({
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
                    }) {
    // definimos el estilo
    // colores:
    const ACCENT = "#2F2A24"; // color principal
    const SOFT = "#F6F3EF"; // fondo suave
    const CARD = "#FFFFFF";
    const BORDER = "#E9E4DE";
    const MUTED = "rgba(47,42,36,0.60)"; // texto secundario

    const [openPanel, setOpenPanel] = useState("review"); // review, diary o null (ver que sección está abierta)

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
    // acciones secundarias (como ver reseñas, regargar, cancelar...)
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
    const pill = (active) => ({
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? ACCENT : CARD, // si está activo --> color principal
        color: active ? "white" : ACCENT,
        fontWeight: active ? 800 : 600,
        cursor: "pointer",
        fontSize: 12,
        lineHeight: "16px",
        whiteSpace: "nowrap",
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
            }}
            type="button"
        >

            <span>{title}</span>
            <span style={{ opacity: 0.7 }}>{openPanel === key ? "—" : "+"}</span>
        </button>

    );

    return (
        <div style={{ background: "#FBFAF8", minHeight: "100vh" }}> {/* vh -> ocupa al menos toda la altura de la ventana */}
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
                            aria-label="Volver"
                            title="Volver"
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
                                // cuando no hay imagen de portada:
                            ) : (
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
                                <div
                                    style={{
                                        marginTop: 2,
                                        fontSize: 12,
                                        color: MUTED,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {book.author}
                                </div>
                            </div>
                        </div>
                    </div>
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
                        {book.cover?.url ? (
                            <img
                                src={book.cover.url}
                                alt={book.title}
                                style={{
                                    width: 96,
                                    height: 144,
                                    objectFit: "cover",
                                    borderRadius: 14,
                                    border: `1px solid ${BORDER}`,
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 96,
                                    height: 144,
                                    background: SOFT,
                                    borderRadius: 14,
                                    border: `1px solid ${BORDER}`,
                                }}
                            />
                        )}

                        {/* info a la derecha */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, marginBottom: 8 }}>
                                Estado
                            </div>

                            {/* status en chips */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={() => cambiarEstado(book.id, "to_read")}
                                    style={pill((book.status || "to_read") === "to_read")}
                                >
                                    Want to read
                                </button>
                                <button
                                    type="button"
                                    onClick={() => cambiarEstado(book.id, "reading")}
                                    style={pill(book.status === "reading")}
                                >
                                    Currently reading
                                </button>
                                <button
                                    type="button"
                                    onClick={() => cambiarEstado(book.id, "paused")}
                                    style={pill(book.status === "paused")}
                                >
                                    Interrupted
                                </button>
                                <button
                                    type="button"
                                    onClick={() => cambiarEstado(book.id, "finished")}
                                    style={pill(book.status === "finished")}
                                >
                                    Finished
                                </button>
                            </div>

                            {customShelves.length > 0 && ( // estanterias personalizadas -> selección múltiple
                                <div style={{ marginTop: 14 }}>
                                    <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, marginBottom: 8 }}>
                                        Añadir también a...
                                    </div>

                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {customShelves.map((s) => {
                                            // si el libro ya pertenece a esa estantería -> estado activo
                                            const active = Array.isArray(book.shelves) && book.shelves.includes(s);
                                            return (
                                                <button
                                                    key={s}
                                                    onClick={() => toggleBookShelf(book.id, s)}
                                                    style={{
                                                        padding: "8px 10px",
                                                        borderRadius: 999,
                                                        border: `1px solid ${active ? ACCENT : BORDER}`,
                                                        background: active ? SOFT : CARD,
                                                        fontWeight: active ? 900 : 700,
                                                        cursor: "pointer",
                                                        color: ACCENT,
                                                        fontSize: 12,
                                                    }}
                                                    type="button"
                                                    title={active ? "Quitar de esta shelf" : "Añadir a esta shelf"} // para hover/lector pantalla
                                                >
                                                    {s}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: 14 }}>
                                <button
                                    onClick={() => borrarLibro(book.id)}
                                    style={{
                                        padding: "12px 14px",
                                        borderRadius: 14,
                                        border: `1px solid ${BORDER}`,
                                        background: CARD,
                                        cursor: "pointer",
                                        width: "100%",
                                        fontWeight: 900,
                                        color: ACCENT,
                                    }}
                                    type="button"
                                >
                                    🗑️ Borrar libro
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* review --> sección desplegable */}
                <div style={{ marginTop: 14 }}>
                    {sectionHeader("Review", "review")}
                    {openPanel === "review" && ( // controlamos si está abierto o no
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
                                    <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, minWidth: 120 }}>
                                        Modo:
                                    </div>

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
                                        Solo para mí
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
                                        title="Publica tu reseña sin mostrar tu identidad"
                                    >
                                        Publicar anónima
                                    </button>
                                </div>

                                <button
                                    onClick={() => guardarReview(book.id, { isPublic: reviewIsPublic, isAnonymous: true })}
                                    style={primaryBtn}
                                    disabled={reviewLoading}
                                    type="button"
                                >
                                    {reviewLoading
                                        ? "Guardando..."
                                        : reviewIsPublic
                                            ? "Guardar y publicar anónimamente"
                                            : "Guardar reseña (privada)"}
                                </button>

                                <div style={{ fontSize: 12, color: MUTED }}>
                                    Estado actual:{" "}
                                    <strong style={{ color: ACCENT }}>
                                        {reviewIsPublic ? "Publicada (anónima)" : "Privada"}
                                    </strong>
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
                                            <div style={{ fontWeight: 900, color: ACCENT }}>Tu reseña guardada</div>
                                            <div style={{ fontSize: 12, color: MUTED }}>
                                                ⭐ {myReview.rating || "?"}/5
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 8, whiteSpace: "pre-wrap", color: ACCENT }}>
                                            {myReview.text}
                                        </div>

                                        <div style={{ marginTop: 8, fontSize: 12, color: MUTED }}>
                                            {myReview.isPublic ? "También está publicada (anónima)" : "No está publicada"}
                                        </div>

                                        {myReview.updatedAt && (
                                            <div style={{ marginTop: 6, fontSize: 11, color: MUTED }}>
                                                Última actualización: {new Date(myReview.updatedAt).toLocaleString()}
                                            </div>
                                        )}

                                        <button
                                            onClick={() => cargarReview(book.id)}
                                            style={{ ...ghostBtn, marginTop: 10 }}
                                            disabled={reviewLoading}
                                            type="button"
                                        >
                                            {reviewLoading ? "Cargando..." : "Recargar mi reseña"}
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ fontSize: 12, color: MUTED }}>
                                        Todavía no has guardado una reseña privada para este libro.
                                    </div>
                                )}

                                <button
                                    onClick={() => cargarResenasPublicas(book.id)}
                                    style={ghostBtn}
                                    type="button"
                                >
                                    Ver reseñas anónimas de otros
                                </button>

                                {publicReviewsLoading ? (
                                    <p style={{ opacity: 0.7, margin: 0 }}>Cargando reseñas...</p>
                                ) : publicReviews.length === 0 ? ( // si no hay resultados
                                    <p style={{ opacity: 0.7, margin: 0 }}>Todavía no hay reseñas públicas para este libro.</p>
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
                                                    <div style={{ fontWeight: 900, color: ACCENT }}>{r.authorLabel || "Anónimo"}</div>
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

                {/* diary --> sección deplegable*/}
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

                                <button onClick={() => crearNota(book.id)} style={primaryBtn} type="button">
                                    Guardar nota
                                </button>
                            </div>

                            {notesLoading ? (
                                <p style={{ opacity: 0.7, margin: 0 }}>Cargando notas...</p>
                            ) : notes.length === 0 ? (
                                <p style={{ opacity: 0.7, margin: 0 }}>Todavía no hay notas para este libro.</p>
                            ) : (
                                <div style={{ display: "grid", gap: 10 }}>
                                    {notes.map((n) => ( // cada nota se muestra como una tarjeta
                                        <div
                                            key={n.id}
                                            style={{
                                                border: `1px solid ${BORDER}`,
                                                borderRadius: 16,
                                                padding: 12,
                                                background: CARD,
                                            }}
                                        >
                                            {editingNoteId === n.id ? ( // si se está editando la nota --> mostrar como input
                                                <div style={{ display: "grid", gap: 10 }}>
                                                    <input
                                                        value={editChapter}
                                                        onChange={(e) => setEditChapter(e.target.value)}
                                                        placeholder="Capítulo / parte (opcional)"
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
                                                        placeholder="Frase destacada (opcional)"
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
                                                            ✅ Guardar
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
                                                            ✖ Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {n.chapter && (
                                                        <div style={{ fontSize: 12, color: MUTED, fontWeight: 800, marginBottom: 6 }}>
                                                            {n.chapter}
                                                        </div>
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
                                                            ✏️ Editar
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
                                                            🗑️ Borrar
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

                {/* separador final para que no choque con bottom nav */}
                <div style={{ height: 84 }} />
            </div>
        </div>
    );
}