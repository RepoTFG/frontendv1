// useEffect: ejecutar code auto
// useState: guardar datos y actualizar estado
import { useEffect, useMemo, useState } from "react";
// Funciones firebase:
// onAuthStateChanged: ver si hay un usuario logeado o no
// signOut: cierra sesión usuario
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // config de firebase
import AuthPage from "./AuthPage"; // login

// muevo bookDetail fuera de la App para evitar perder el foco al escribir en los inputs
function BookDetail({
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
                                    <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                                    <option value={4}>⭐⭐⭐⭐ (4)</option>
                                    <option value={3}>⭐⭐⭐ (3)</option>
                                    <option value={2}>⭐⭐ (2)</option>
                                    <option value={1}>⭐ (1)</option>
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

export default function App() {
    const [user, setUser] = useState(null); // guardamos user autenticado
    const [loading, setLoading] = useState(true); // controlar si aun estamos comprobando la sesión (T: cargando; F: sabemos si hay)
    const [books, setBooks] = useState([]); // lista de libros usuario
    const [query, setQuery] = useState(""); // texto que escribe el usuario
    const [results, setResults] = useState([]);// resultados de la búsqueda
    const [searching, setSearching] = useState(false); // para mostrar “buscando...”
    const [selectedBook, setSelectedBook] = useState(null); // libro seleccionado (vista detalle)
    // shelves personalizadas
    const [customShelves, setCustomShelves] = useState([]);
    const [newShelfName, setNewShelfName] = useState("");
    //const [addShelfChoice, setAddShelfChoice] = useState("");
    const [addStatusByKey, setAddStatusByKey] = useState({});

    // estados para notas
    const [notes, setNotes] = useState([]); // notas del libro seleccionado
    const [noteText, setNoteText] = useState("");  // texto de la nota
    const [noteChapter, setNoteChapter] = useState(""); // capítulo/parte
    const [noteQuote, setNoteQuote] = useState(""); // cita/frase
    const [notesLoading, setNotesLoading] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null); // id de nota en edición
    const [editText, setEditText] = useState(""); // texto editado
    const [editChapter, setEditChapter] = useState(""); // capítulo editado
    const [editQuote, setEditQuote] = useState(""); // cita editada
    // estados para review
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewIsPublic, setReviewIsPublic] = useState(false);
    const [reviewIsAnonymous, setReviewIsAnonymous] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [publicReviews, setPublicReviews] = useState([]);
    const [publicReviewsLoading, setPublicReviewsLoading] = useState(false);
    const [myReview, setMyReview] = useState(null);

    const [activeTab, setActiveTab] = useState("home"); // home | library | diary | discover | room

    // definimos colores
    const ACCENT = "#2F2A24";
    const SOFT = "#F6F3EF";
    const CARD = "#FFFFFF";
    const BORDER = "#E9E4DE";
    const MUTED = "rgba(47,42,36,0.60)";
    // contenido principal de la página
    const pageWrap = {
        background: "#FBFAF8",
        minHeight: "100vh",
        paddingBottom: 78, // espacio para bottom nav
    };
    // contenido centrado
    const container = {
        padding: 16,
        maxWidth: 520,
        margin: "0 auto",
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

    const primaryBtn = {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${ACCENT}`,
        background: ACCENT,
        color: "white",
        cursor: "pointer",
        fontWeight: 800,
        whiteSpace: "nowrap",
    };

    const ghostBtn = {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: CARD,
        color: ACCENT,
        cursor: "pointer",
        fontWeight: 800,
        whiteSpace: "nowrap",
    };

    const smallGhostBtn = {
        padding: "8px 10px",
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        background: CARD,
        color: ACCENT,
        cursor: "pointer",
        fontWeight: 800,
        fontSize: 12,
    };

    // probar /api/me (manda token al backend)
    const probarMe = async () => {
        try {
            const token = await auth.currentUser.getIdToken(); //pedimos tojen user logueado
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/me`, { // enviamos token en header
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json(); // respuesta a json
            alert(`UID: ${data.uid}\nEmail: ${data.email}`); //datos
        } catch (e) {
            alert("Error al comprobar el usuario");
        }
    };

    // listar libros (GET /api/books)
    const listarLibros = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            console.log("GET /api/books status:", res.status);
            console.log("GET /api/books data:", data);

            if (!res.ok) {
                alert(data.error || "Error al listar libros");
                setBooks([]);
                return;
            }

            setBooks(Array.isArray(data) ? data : []);
        } catch (e) {
            alert("Error al listar los libros");
        }
    };

    // búsqueda de libros mediante Open Library (API)
    // la búsqueda ahora está por título (después se puede cambiar: ISBN, autor...)
    const buscarLibros = async () => {
        const q = query.trim(); // quitar espacios inicio-fin
        if (!q) return; // si está vacío no buscamos

        setSearching(true);
        try {
            // llamamos a la API
            const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&limit=10`;
            const res = await fetch(url);
            const data = await res.json();

            setResults(data.docs || []); // guardamos docs (resultados) en estado para mostrar
        } catch (e) {
            alert("Error buscando libros");
        } finally {
            setSearching(false);
        }
    };

    // separar libros por "shelves" (status)
    const wantToRead = (Array.isArray(books) ? books : []).filter((b) => b.status === "to_read");
    const currentlyReading = (Array.isArray(books) ? books : []).filter((b) => b.status === "reading");
    const interrupted = (Array.isArray(books) ? books : []).filter((b) => b.status === "paused");
    const finished = (Array.isArray(books) ? books : []).filter((b) => b.status === "finished");
    // shelf personalizada
    const customSections = customShelves.map((name) => ({
        name,
        items: (Array.isArray(books) ? books : []).filter((b) => Array.isArray(b.shelves) && b.shelves.includes(name)),
    }));

    // cambiar estado libro (PATCH /api/books/:id)
    const cambiarEstado = async (id, status) => {
        const token = await auth.currentUser.getIdToken();
        await fetch(`${process.env.REACT_APP_API_URL}/api/books/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });

        // actualiza el libro seleccionado si coincide
        setSelectedBook((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
        listarLibros();
    };

    // borrar un libro (DELETE /api/books/:id)
    const borrarLibro = async (id) => {
        // confirmación para no borrar sin querer
        const ok = window.confirm("¿Seguro que quieres borrar este libro?");
        if (!ok) return;

        try {
            const token = await auth.currentUser.getIdToken();

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al borrar el libro");
                return;
            }
            setSelectedBook((prev) => (prev && prev.id === id ? null : prev));
            listarLibros(); // refrescar biblioteca
        } catch (e) {
            alert("Error al borrar el libro");
        }
    };

    const cargarNotas = async (bookId) => {
        setNotesLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books/${bookId}/notes`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al cargar notas");
                setNotes([]);
                return;
            }

            setNotes(Array.isArray(data) ? data : []);
        } catch (e) {
            alert("Error al cargar notas");
        } finally {
            setNotesLoading(false);
        }
    };

    const crearNota = async (bookId) => {

        const text = noteText.trim();
        if (!text) return alert("Escribe una nota primero");

        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books/${bookId}/notes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    chapter: noteChapter.trim(),
                    text,
                    quote: noteQuote.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al guardar la nota");
                return;
            }

            // limpiar form
            setNoteText("");
            setNoteChapter("");
            setNoteQuote("");

            // recargar notas
            cargarNotas(bookId);
        } catch (e) {
            alert("Error al guardar la nota");
        }
    };

    const borrarNota = async (noteId) => {
        console.log("Intentando borrar nota:", noteId);
        const ok = window.confirm("¿Seguro que quieres borrar esta nota?");
        if (!ok) return;

        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notes/${noteId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al borrar la nota");
                return;
            }
            // refrescar notas del libro actual
            if (selectedBook) cargarNotas(selectedBook.id);
        } catch (e) {
            alert("Error al borrar la nota");
        }
    };

    const empezarEditarNota = (note) => {
        setEditingNoteId(note.id);
        setEditText(note.text || "");
        setEditChapter(note.chapter || "");
        setEditQuote(note.quote || "");
    };

    const cancelarEditarNota = () => {
        setEditingNoteId(null);
        setEditText("");
        setEditChapter("");
        setEditQuote("");
    };

    const guardarEdicionNota = async (noteId) => {
        const text = editText.trim();
        if (!text) return alert("El texto no puede estar vacío");

        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notes/${noteId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    text,
                    chapter: editChapter.trim(),
                    quote: editQuote.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al editar la nota");
                return;
            }

            // refrescar y salir del modo edición
            if (selectedBook) await cargarNotas(selectedBook.id);
            cancelarEditarNota();
        } catch (e) {
            alert("Error al editar la nota");
        }
    };

    // review
    const cargarReview = async (bookId) => {
        setReviewLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books/${bookId}/review`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al cargar reseña");
                return;
            }

            if (!data) {
                setMyReview(null);
                setReviewText("");
                setReviewRating(5);
                setReviewIsPublic(false);
                setReviewIsAnonymous(true);
                return;
            }

            setMyReview(data);
            setReviewText(data.text || "");
            setReviewRating(data.rating ? Number(data.rating) : 5);
            setReviewIsPublic(!!data.isPublic);
            setReviewIsAnonymous(data.isAnonymous !== false);
        } catch (e) {
            alert("Error al cargar reseña");
        } finally {
            setReviewLoading(false);
        }
    };

    const guardarReview = async (bookId, overrides = {}) => {
        const text = reviewText.trim();
        if (!text) return alert("Escribe una reseña primero");

        try {
            const token = await auth.currentUser.getIdToken();

            const payload = {
                text,
                rating: reviewRating ? Number(reviewRating) : null,
                isPublic: reviewIsPublic,
                isAnonymous: reviewIsAnonymous,
                ...overrides,
            };

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books/${bookId}/review`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) return alert(data.error || "Error al guardar reseña");

            setMyReview(data);
            setReviewIsPublic(!!data.isPublic);
            setReviewIsAnonymous(data.isAnonymous !== false);
            setReviewRating(data.rating ? Number(data.rating) : reviewRating);

            alert(overrides.isPublic ? "Reseña publicada" : "Reseña guardada");
        } catch (e) {
            alert("Error al guardar reseña");
        }
    };

    const compartirReviewAnonima = async (bookId) => {
        setReviewLoading(true);
        try {
            await guardarReview(bookId, { isPublic: true, isAnonymous: true });
        } finally {
            setReviewLoading(false);
        }
    };

    const cargarResenasPublicas = async (bookId) => {
        setPublicReviewsLoading(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reviews/public?bookId=${bookId}`);
            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al cargar reseñas públicas");
                setPublicReviews([]);
                return;
            }
            setPublicReviews(Array.isArray(data) ? data : []);
        } catch (e) {
            alert("Error al cargar reseñas públicas");
        } finally {
            setPublicReviewsLoading(false);
        }
    };

    // shelves personalizadas
    const listarShelves = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/shelves`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al listar shelves");
                setCustomShelves([]);
                return;
            }

            // guardamos solo los nombres
            setCustomShelves(Array.isArray(data) ? data.map((s) => s.name) : []);
        } catch (e) {
            alert("Error al listar shelves");
        }
    };

    const cambiarShelf = async (id, shelf) => {
        const token = await auth.currentUser.getIdToken();
        await fetch(`${process.env.REACT_APP_API_URL}/api/books/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ shelf }),
        });

        // si elijo shelf, quito status --> por ello, lo dejo en to_read para no romper nada
        setSelectedBook((prev) => (prev && prev.id === id ? { ...prev, shelf } : prev));
        listarLibros();
    };

    const toggleBookShelf = async (bookId, shelfName) => {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books/${bookId}/shelves/toggle`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ shelf: shelfName }),
        });

        const data = await res.json().catch(() => null);

        // refrescar
        if (res.ok && data && data.id) {
            setSelectedBook((prev) => (prev && prev.id === bookId ? { ...prev, ...data } : prev));
        }
        listarLibros();
    };

    // --- Estantería visual (lomitos) para libros terminados ---
    // --- Estantería visual (lomitos) para libros terminados ---
// Sin fórmulas: paleta fija + asignación por índice
    const FinishedBookshelf = ({ items, onPick }) => {
        const MAX = 150;
        const books = (Array.isArray(items) ? items : []).slice(0, MAX);

        const PALETTE = [
            "#E7D7C9",
            "#DCC7B5",
            "#CDB7A3",
            "#EADCCF",
            "#D9C9C0",
            "#C9B2A7",
            "#E3D0B9",
            "#D8C2A8",
            "#D1C6B8",
            "#CBB8B0",
            "#E6D6D6",
            "#D4CFC7",
        ];

        const pickColor = (i) => PALETTE[i % PALETTE.length];

        return (
            <div style={{ marginTop: 14 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 10,
                        marginBottom: 10,
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: 16, letterSpacing: -0.2, color: ACCENT }}>
                        Bookshelf
                    </h2>
                    <div style={{ fontSize: 12, color: MUTED, fontWeight: 800 }}>
                        {items.length}
                    </div>
                </div>

                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 18,
                        background: CARD,
                        padding: 14,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            borderRadius: 14,
                            background: SOFT,
                            padding: 12,
                        }}
                    >
                        {books.length === 0 ? (
                            <div style={{ color: MUTED, fontSize: 13, fontWeight: 700 }}>
                                Aquí irán los libros terminados.
                            </div>
                        ) : (
                            <>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-end",
                                        gap: 8,
                                        overflowX: "auto",
                                        paddingBottom: 10,
                                        WebkitOverflowScrolling: "touch",
                                    }}
                                >
                                    {books.map((b, idx) => {
                                        // cambiamos tamaño de los lomos(3 tamaños fijos)
                                        const HEIGHTS = [118, 124, 130];
                                        const WIDTHS = [26, 30, 33];
                                        const h = HEIGHTS[idx % HEIGHTS.length];
                                        const w = WIDTHS[idx % WIDTHS.length];

                                        return (
                                            <button
                                                key={b.id}
                                                type="button"
                                                onClick={() => onPick?.(b)}
                                                title={b.title}
                                                style={{
                                                    height: h,
                                                    width: w,
                                                    border: `1px solid ${BORDER}`,
                                                    borderRadius: 10,
                                                    background: pickColor(idx),
                                                    cursor: "pointer",
                                                    padding: 0,
                                                    flex: "0 0 auto",
                                                    position: "relative",
                                                    boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                                                }}
                                            >
                                                {/* texto rotado */}
                                                <div
                                                    style={{
                                                        position: "absolute",
                                                        left: "50%",
                                                        top: "50%",
                                                        transform: "translate(-50%, -50%) rotate(-90deg)",
                                                        width: h - 16,
                                                        textAlign: "center",
                                                        fontSize: 10,
                                                        fontWeight: 900,
                                                        color: ACCENT,
                                                        opacity: 0.92,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        padding: "0 6px",
                                                        pointerEvents: "none",
                                                    }}
                                                >
                                                    {b.title || "Sin título"}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* base de la balda */}
                                <div
                                    style={{
                                        height: 10,
                                        borderRadius: 999,
                                        background: "rgba(47,42,36,0.12)",
                                    }}
                                />
                            </>
                        )}
                    </div>

                    {books.length > 0 && (
                        <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>
                            Toca un lomo para abrir el libro.
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // sección shelf con portadas
    const Section = ({ title, items }) => (
        <div style={{ marginTop: 14 }}>
            {/* título de la sección --> flex: título a la izquierda */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: 16, letterSpacing: -0.2, color: ACCENT }}>{title}</h2>
                <div style={{ fontSize: 12, color: MUTED, fontWeight: 800 }}>{items.length}</div>
            </div>

            {/* si no hay libros --> mostramos texto */}
            {items.length === 0 ? (
                <p style={{ opacity: 0.7, marginTop: 10 }}>No hay libros aquí todavía</p>
            ) : (
                // grid con portadas (solo portada + texto, sin select/botones)
                <div
                    style={{
                        marginTop: 10,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", // adaptamos nº columnas al ancho disponible
                        gap: 14,
                    }}
                >
                    {items.map((book) => (
                        <div key={book.id} style={{ minWidth: 0 }}>
                            {/* si hay portada mostramos img --> si no, placeholder */}
                            {book.cover?.url ? (
                                <img
                                    src={book.cover.url} // url guardada en firestore
                                    alt={book.title}
                                    onClick={() => setSelectedBook(book)} // libro selaccionado -> abrir detalle
                                    style={{
                                        width: "100%",
                                        aspectRatio: "2 / 3",
                                        objectFit: "cover",
                                        borderRadius: 16,
                                        border: `1px solid ${BORDER}`,
                                        cursor: "pointer",
                                        background: SOFT,
                                    }}
                                />
                            ) : (
                                // placeholder cuando no portada
                                <div
                                    onClick={() => setSelectedBook(book)}
                                    style={{
                                        width: "100%",
                                        aspectRatio: "2 / 3",
                                        background: SOFT,
                                        borderRadius: 16,
                                        border: `1px solid ${BORDER}`,
                                        cursor: "pointer",
                                    }}
                                />
                            )}

                            {/* texto debajo de la portada */}
                            <div style={{ marginTop: 8, fontSize: 12, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        color: ACCENT,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {book.title}
                                </div>
                                <div
                                    style={{
                                        marginTop: 2,
                                        opacity: 0.6,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {book.author}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // añadir resultado de búsqueda eligiendo en que shelf colocar
    const addFromResult = async (doc, { status, shelves } = {}) => {
        try {
            const token = await auth.currentUser.getIdToken();

            // comprobamos si el libro ya existe en la biblioteca
            // primero intentamos por openLibraryCoverId
            const existingByCover = doc.cover_i
                ? books.find(
                    (b) => b?.cover?.openLibraryCoverId === doc.cover_i
                )
                : null;

            // fallback: título + autor
            const titleNormalized = (doc.title || "").trim().toLowerCase();
            const authorNormalized = (
                (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : ""
            ).trim().toLowerCase();

            const existingByText = books.find((b) => {
                const bt = (b.title || "").trim().toLowerCase();
                const ba = (b.author || "").trim().toLowerCase();
                return bt === titleNormalized && ba === authorNormalized;
            });

            const existingBook = existingByCover || existingByText;

            // si ya existe --> actualizamos, no crear duplicado

            if (existingBook) {

                // si viene de status y es distinto --> actualizamos status
                if (status && existingBook.status !== status) {
                    await cambiarEstado(existingBook.id, status);
                }

                // si vienen de shelves --> añadirlas si no existen
                if (Array.isArray(shelves) && shelves.length > 0) {
                    for (const s of shelves) {
                        const hasShelf =
                            Array.isArray(existingBook.shelves) &&
                            existingBook.shelves.includes(s);

                        if (!hasShelf) {
                            await toggleBookShelf(existingBook.id, s);
                        }
                    }
                }

                // refrescar biblioteca y salir
                listarLibros();
                return;
            }
            // si no existe → crear libro nuevo (la lógica de antes)
            const title = doc.title || "Sin título";
            const author = (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : "";

            const coverUrl = doc.cover_i
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                : "";

            // si se elige shelf personalizada y no viene status, ponemos uno por defecto
            const finalStatus = status || "to_read";

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    author,
                    status: finalStatus,
                    shelves: Array.isArray(shelves) ? shelves : [],
                    tags: ["biblioteca"],
                    genres: doc.subject ? doc.subject.slice(0, 3) : [],
                    cover: {
                        source: "openlibrary",
                        url: coverUrl,
                        openLibraryCoverId: doc.cover_i || null,
                    },
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data.error || "Error al añadir libro");
                return;
            }

            listarLibros();
        } catch (e) {
            alert("Error al añadir el libro");
        }
    };


    useEffect(() => {
        // escuchamos los cambios de sesión (se ejecuta cada vez que se inicia o cierra sesión)
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u); // guardamos usuario
            setLoading(false); // ya hemos terminado de comprobar sesión
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        // cuando ya hay usuario, cargamos libros automáticamente
        if (user) {
            listarLibros();
            listarShelves(); // ahora también shelves personalizadas
        }
    }, [user]);

    useEffect(() => {
        if (selectedBook) {
            // cuando se abre el detalle de un libro → cargar sus notas
            cargarNotas(selectedBook.id);
            cargarReview(selectedBook.id);
        } else {
            // cuando se vuelve atrás → limpiar estado de notas
            setNotes([]);
            setNoteText("");
            setNoteChapter("");
            setNoteQuote("");
            // ahora también review
            setMyReview(null);
            setReviewText("");
            setReviewRating(5);
            setReviewIsPublic(false);
            setReviewIsAnonymous(true);
            setPublicReviews([]);
        }
    }, [selectedBook]);

    const topBarTitle = useMemo(() => {
        if (activeTab === "home") return "Home";
        if (activeTab === "library") return "Library";
        if (activeTab === "diary") return "Diary";
        if (activeTab === "discover") return "Discover";
        return "Room";
    }, [activeTab]);

    const TopBar = () => ( // encabezado fijo superior
        <div
            style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "#FBFAF8",
                borderBottom: `1px solid ${BORDER}`,
            }}
        >
            <div style={{ ...container, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: ACCENT }}>{topBarTitle}</div>
                <button onClick={() => signOut(auth)} style={smallGhostBtn} type="button">
                    Cerrar sesión
                </button>
            </div>
        </div>
    );

    const BottomNav = () => ( // botones nav fija
        <div
            style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                background: CARD,
                borderTop: `1px solid ${BORDER}`,
                paddingBottom: "max(10px, env(safe-area-inset-bottom))", // safe area movil ->iOS con notch
                zIndex: 20,
            }}
        >
            <div
                style={{
                    maxWidth: 520,
                    margin: "0 auto",
                    padding: "10px 16px",
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 6,
                }}
            >
                {[
                    { key: "home", label: "Home", icon: "⌂" },
                    { key: "library", label: "Library", icon: "≡" },
                    { key: "diary", label: "Diary", icon: "▦" },
                    { key: "discover", label: "Discover", icon: "✦" },
                    { key: "room", label: "Room", icon: "☺" },
                ].map((t) => {
                    const active = activeTab === t.key;
                    // cambiar estilos según si está activo o no
                    // activo: ACCENT, 900
                    // inactivo: MUTED, 800
                    return (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                padding: "6px 8px",
                                borderRadius: 12,
                                color: active ? ACCENT : MUTED,
                                fontWeight: active ? 900 : 800,
                            }}
                            type="button"
                        >
                            <div style={{ fontSize: 18, lineHeight: "18px" }}>{t.icon}</div>
                            <div style={{ fontSize: 11, marginTop: 6 }}>{t.label}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );

    if (loading) return <p>Cargando...</p>; // si aun comprobando sesión
    if (!user) return <AuthPage />; // no usuario logueado
    // si hay usuario logueado --> página
    if (selectedBook) {
        return (
            <BookDetail
                book={selectedBook}
                onBack={() => {
                    setSelectedBook(null);
                    cancelarEditarNota();
                }}
                cambiarEstado={cambiarEstado}
                cambiarShelf={cambiarShelf}
                customShelves={customShelves}
                borrarLibro={borrarLibro}
                notes={notes}
                notesLoading={notesLoading}
                noteText={noteText}
                setNoteText={setNoteText}
                noteChapter={noteChapter}
                setNoteChapter={setNoteChapter}
                noteQuote={noteQuote}
                setNoteQuote={setNoteQuote}
                crearNota={crearNota}
                borrarNota={borrarNota}
                editingNoteId={editingNoteId}
                editText={editText}
                setEditText={setEditText}
                editChapter={editChapter}
                setEditChapter={setEditChapter}
                editQuote={editQuote}
                setEditQuote={setEditQuote}
                empezarEditarNota={empezarEditarNota}
                cancelarEditarNota={cancelarEditarNota}
                guardarEdicionNota={guardarEdicionNota}
                reviewText={reviewText}
                setReviewText={setReviewText}
                reviewRating={reviewRating}
                setReviewRating={setReviewRating}
                publicReviews={publicReviews}
                publicReviewsLoading={publicReviewsLoading}
                cargarResenasPublicas={cargarResenasPublicas}
                guardarReview={guardarReview}
                compartirReviewAnonima={compartirReviewAnonima}
                reviewIsPublic={reviewIsPublic}
                setReviewIsPublic={setReviewIsPublic}
                setReviewIsAnonymous={setReviewIsAnonymous}
                cargarReview={cargarReview}
                myReview={myReview}
                reviewLoading={reviewLoading}
                toggleBookShelf={toggleBookShelf}
            />
        );
    }

    return (
        <div style={pageWrap}>
            <TopBar />

            <div style={container}>
                {/* home -> solo renderizamos si user está en home */}
                {activeTab === "home" && (
                    <>
                        {/* card búsqueda */}
                        <div
                            style={{
                                border: `1px solid ${BORDER}`,
                                borderRadius: 18,
                                background: CARD,
                                padding: 14,
                            }}
                        >
                            <div style={{ fontWeight: 900, color: ACCENT, marginBottom: 10 }}>
                                Buscar
                            </div>

                            <div style={{ display: "flex", gap: 10 }}>
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Título, autor o ISBN"
                                    style={inputStyle}
                                />
                                <button onClick={buscarLibros} style={primaryBtn} type="button">
                                    {/* cambiamos el texto del botón si está buscando */}
                                    {searching ? "..." : "Buscar"}
                                </button>
                            </div>
                        </div>


                        {/* resultados tipo cards */}
                        {results.length > 0 && (
                            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                                {results.map((doc) => {
                                    // portada "M" (mediana) para mostrar en resultados
                                    const cover = doc.cover_i
                                        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                                        : null;

                                    const author = (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : "Autor desconocido";
                                    const currentStatus = addStatusByKey[doc.key] || "to_read";
                                    // buscar si este resultado ya existe en mi biblioteca (para marcar shelves activas)
                                    const existingByCover = doc.cover_i
                                        ? books.find((b) => b?.cover?.openLibraryCoverId === doc.cover_i)
                                        : null;

                                    const titleNormalized = (doc.title || "").trim().toLowerCase();
                                    const authorNormalized = (
                                        (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : ""
                                    ).trim().toLowerCase();

                                    const existingByText = books.find((b) => {
                                        const bt = (b.title || "").trim().toLowerCase();
                                        const ba = (b.author || "").trim().toLowerCase();
                                        return bt === titleNormalized && ba === authorNormalized;
                                    });

                                    const existingBook = existingByCover || existingByText;

                                    return (
                                        <div
                                            key={doc.key}
                                            style={{
                                                border: `1px solid ${BORDER}`,
                                                borderRadius: 18,
                                                background: CARD,
                                                padding: 12,
                                                display: "flex",
                                                gap: 12,
                                            }}
                                        >
                                            {cover ? (
                                                <img
                                                    src={cover}
                                                    alt="Portada"
                                                    style={{ width: 56, height: 84, objectFit: "cover", borderRadius: 12, border: `1px solid ${BORDER}` }}
                                                />
                                            ) : (
                                                <div style={{ width: 56, height: 84, background: SOFT, borderRadius: 12, border: `1px solid ${BORDER}` }} />
                                            )}

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 900,
                                                        color: ACCENT,
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {doc.title}
                                                </div>
                                                <div style={{ marginTop: 4, color: MUTED, fontSize: 12 }}>{author}</div>

                                                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                        {[
                                                            { key: "to_read", label: "Want to read" },
                                                            { key: "reading", label: "Currently reading" },
                                                            { key: "paused", label: "Interrupted" },
                                                            { key: "finished", label: "Finished" },
                                                        ].map((opt) => {
                                                            const active = (addStatusByKey[doc.key] || "") === opt.key;

                                                            return (
                                                                <button
                                                                    key={opt.key}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        // guardamos status seleccionado (UI)
                                                                        setAddStatusByKey((prev) => ({ ...prev, [doc.key]: opt.key }));

                                                                        // acción inmediata (como en detalle libro)
                                                                        addFromResult(doc, { status: opt.key });
                                                                    }}
                                                                    style={{
                                                                        padding: "8px 10px",
                                                                        borderRadius: 999,
                                                                        border: `1px solid ${active ? ACCENT : BORDER}`,
                                                                        background: active ? ACCENT : CARD,
                                                                        color: active ? "white" : ACCENT,
                                                                        fontWeight: active ? 800 : 600,
                                                                        cursor: "pointer",
                                                                        fontSize: 12,
                                                                        lineHeight: "16px",
                                                                        whiteSpace: "nowrap",
                                                                    }}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                </div>

                                                {customShelves.length > 0 && (
                                                    <div style={{ marginTop: 10 }}>
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                color: MUTED,
                                                                fontWeight: 800,
                                                                marginBottom: 8,
                                                            }}
                                                        >
                                                            Añadir también a...
                                                        </div>

                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                            {customShelves.map((s) => {
                                                                // si el libro ya pertenece a esa estantería -> estado activo (igual que BookDetail)
                                                                const active =
                                                                    !!existingBook &&
                                                                    Array.isArray(existingBook.shelves) &&
                                                                    existingBook.shelves.includes(s);

                                                                return (
                                                                    <button
                                                                        key={s}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            // si el libro existe -> toggle real (igual que detalle libro)
                                                                            if (existingBook?.id) {
                                                                                toggleBookShelf(existingBook.id, s);
                                                                                return;
                                                                            }

                                                                            // si NO existe -> lo creamos ya con esa shelf (y status por defecto)
                                                                            addFromResult(doc, {
                                                                                status: addStatusByKey[doc.key] || "to_read",
                                                                                shelves: [s],
                                                                            });
                                                                        }}
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
                                                                        title={active ? "Quitar de esta shelf" : "Añadir a esta shelf"}
                                                                    >
                                                                        {s}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}



                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <FinishedBookshelf
                            items={finished}
                            onPick={(b) => setSelectedBook(b)}
                        />

                        <Section title="Currently reading" items={currentlyReading} />
                    </>
                )}

                {/* library */}
                {activeTab === "library" && (
                    <>
                        <Section title="Currently reading" items={currentlyReading} />
                        <Section title="Want to read" items={wantToRead} />
                        <Section title="Interrupted" items={interrupted} />
                        <Section title="Finished" items={finished} />
                        {customSections.map((sec) => (
                            <Section key={sec.name} title={sec.name} items={sec.items} />
                        ))}
                    </>
                )}

                {/* diary (por ahora está simple y el contenido está dentro de detalle libro -> luego mirar) */}
                {activeTab === "diary" && (
                    <div
                        style={{
                            border: `1px solid ${BORDER}`,
                            borderRadius: 18,
                            background: CARD,
                            padding: 14,
                        }}
                    >
                        <div style={{ fontWeight: 900, color: ACCENT }}>Diary</div>
                        <div style={{ marginTop: 8, color: MUTED, fontSize: 13 }}>
                            Abre un libro para escribir notas en su sección Diary.
                        </div>
                    </div>
                )}

                {/* discover (más adelante) */}
                {activeTab === "discover" && (
                    <div
                        style={{
                            border: `1px solid ${BORDER}`,
                            borderRadius: 18,
                            background: CARD,
                            padding: 14,
                        }}
                    >
                        <div style={{ fontWeight: 900, color: ACCENT }}>Discover</div>
                        <div style={{ marginTop: 8, color: MUTED, fontSize: 13 }}>
                            Aquí poner recomendaciones...
                        </div>

                        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                            <button onClick={probarMe} style={ghostBtn} type="button">Probar /api/me</button>
                            <button onClick={listarLibros} style={ghostBtn} type="button">Listar mis libros</button>
                        </div>
                    </div>
                )}

                {/* room (custom shelves + crear) --> esto luego se modifica */}
                {activeTab === "room" && (
                    <>
                        <div
                            style={{
                                border: `1px solid ${BORDER}`,
                                borderRadius: 18,
                                background: CARD,
                                padding: 14,
                            }}
                        >
                            <div style={{ fontWeight: 900, color: ACCENT }}>ReadRoom</div>
                            <div style={{ marginTop: 6, color: MUTED, fontSize: 12 }}>
                                Sesión iniciada: {user.email} {/* luego cambiar por nickname o algo así */}
                            </div>
                        </div>

                        <div style={{ marginTop: 14 }}>
                            <h3 style={{ margin: "0 0 10px 0", color: ACCENT }}>Custom shelves</h3>

                            <div
                                style={{
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 18,
                                    padding: 14,
                                    background: CARD,
                                }}
                            >
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    <input
                                        value={newShelfName}
                                        onChange={(e) => setNewShelfName(e.target.value)}
                                        placeholder="Nombre de la shelf"
                                        style={inputStyle}
                                    />

                                    <button
                                        onClick={async () => {
                                            const name = newShelfName.trim();
                                            if (!name) return;

                                            try {
                                                const token = await auth.currentUser.getIdToken();
                                                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/shelves`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                    body: JSON.stringify({ name }),
                                                });

                                                const data = await res.json();
                                                if (!res.ok) {
                                                    alert(data.error || "Error al crear shelf");
                                                    return;
                                                }

                                                setNewShelfName("");
                                                listarShelves(); // refrescamos la lsita desde db
                                            } catch (e) {
                                                alert("Error al crear shelf");
                                            }
                                        }}
                                        style={primaryBtn}
                                        title="Crear shelf"
                                        type="button"
                                    >
                                        ➕ Crear
                                    </button>
                                </div>

                                <div style={{ marginTop: 12 }}>
                                    {customShelves.length === 0 ? (
                                        <div style={{ opacity: 0.7, fontSize: 13 }}>
                                            Aún no hay shelves personalizadas.
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                            {customShelves.map((s) => (
                                                <div
                                                    key={s}
                                                    style={{
                                                        padding: "8px 10px",
                                                        borderRadius: 999,
                                                        border: `1px solid ${BORDER}`,
                                                        background: SOFT,
                                                        fontSize: 12,
                                                        fontWeight: 900,
                                                        color: ACCENT,
                                                    }}
                                                    title="Shelf personalizada"
                                                >
                                                    {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
