// useEffect: ejecutar code auto
// useState: guardar datos y actualizar estado
import { useEffect, useState } from "react";
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
                    }) {
    return (
        <div style={{ padding: 16, maxWidth: 520, margin: "0 auto" }}>
            <button onClick={onBack} style={{ marginBottom: 12 }}>
                ← Volver
            </button>

            <div style={{ display: "flex", gap: 12 }}>
                {/* portada */}
                {book.cover?.url ? (
                    <img
                        src={book.cover.url}
                        alt={book.title}
                        style={{
                            width: 120,
                            height: 180,
                            objectFit: "cover",
                            borderRadius: 10,
                            border: "1px solid #eee",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: 120,
                            height: 180,
                            background: "#f0f0f0",
                            borderRadius: 10,
                            border: "1px solid #eee",
                        }}
                    />
                )}

                {/* info */}
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0 }}>{book.title}</h2>
                    <p style={{ margin: "6px 0", opacity: 0.8 }}>{book.author}</p>

                    <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                            Estado
                        </div>

                        {/* reutilizamos PATCH */}
                        <select
                            value={book.status || "to_read"}
                            onChange={(e) => cambiarEstado(book.id, e.target.value)}
                            style={{ padding: 8, width: "100%" }}
                        >
                            <option value="to_read">Want to read</option>
                            <option value="reading">Currently reading</option>
                            <option value="paused">Interrupted</option>
                            <option value="finished">Finished</option>
                        </select>

                        <button
                            onClick={() => borrarLibro(book.id)}
                            style={{ marginTop: 10, width: "100%" }}
                        >
                            🗑️ Borrar libro
                        </button>
                    </div>
                </div>
            </div>

            <hr style={{ margin: "16px 0" }} />
            <h3>Review</h3>

            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    style={{ padding: 8 }}
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
                    style={{ padding: 8, resize: "vertical" }}
                />

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ fontSize: 12, opacity: 0.75, minWidth: 120 }}>
                        Modo:
                    </div>

                    <button
                        onClick={() => {
                            // modo privado
                            // (no cambia tu reseña, solo el modo de guardado)
                            setReviewIsPublic(false);
                            setReviewIsAnonymous(true);
                        }}
                        style={{
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "1px solid #ddd",
                            background: reviewIsPublic ? "white" : "#f3f3f3",
                            fontWeight: reviewIsPublic ? 400 : 700,
                            cursor: "pointer",
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
                            padding: "8px 10px",
                            borderRadius: 10,
                            border: "1px solid #ddd",
                            background: reviewIsPublic ? "#f3f3f3" : "white",
                            fontWeight: reviewIsPublic ? 700 : 400,
                            cursor: "pointer",
                        }}
                        type="button"
                        title="Publica tu reseña sin mostrar tu identidad"
                    >
                        Publicar anónima
                    </button>
                </div>

                <button
                    onClick={() => guardarReview(book.id, { isPublic: reviewIsPublic, isAnonymous: true })}
                    style={{ padding: 10 }}
                    disabled={reviewLoading}
                >
                    {reviewLoading
                        ? "Guardando..."
                        : reviewIsPublic
                            ? "Guardar y publicar anónimamente"
                            : "Guardar reseña (privada)"}
                </button>

                <div style={{ fontSize: 12, opacity: 0.75 }}>
                    Estado actual:{" "}
                    <strong>{reviewIsPublic ? "Publicada (anónima)" : "Privada"}</strong>
                </div>

                {/* TU RESEÑA GUARDADA (solo tú) */}
                {myReview && myReview.text ? (
                    <div
                        style={{
                            border: "1px solid #eee",
                            borderRadius: 12,
                            padding: 12,
                            background: "#fafafa",
                            marginTop: 6,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ fontWeight: 800 }}>Tu reseña guardada</div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>
                                ⭐ {myReview.rating || "?"}/5
                            </div>
                        </div>

                        <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                            {myReview.text}
                        </div>

                        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                            {myReview.isPublic ? "También está publicada (anónima)" : "No está publicada"}
                        </div>

                        {myReview.updatedAt && (
                            <div style={{ marginTop: 6, fontSize: 11, opacity: 0.6 }}>
                                Última actualización: {new Date(myReview.updatedAt).toLocaleString()}
                            </div>
                        )}

                        <button
                            onClick={() => cargarReview(book.id)}
                            style={{ marginTop: 10, padding: "8px 10px", width: "100%" }}
                            disabled={reviewLoading}
                        >
                            {reviewLoading ? "Cargando..." : "Recargar mi reseña"}
                        </button>
                    </div>
                ) : (
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                        Todavía no has guardado una reseña privada para este libro.
                    </div>
                )}

                <button onClick={() => cargarResenasPublicas(book.id)} style={{ padding: "8px 10px" }}>
                    Ver reseñas anónimas de otros
                </button>

                {publicReviewsLoading ? (
                    <p style={{ opacity: 0.7 }}>Cargando reseñas...</p>
                ) : publicReviews.length === 0 ? (
                    <p style={{ opacity: 0.7 }}>Todavía no hay reseñas públicas para este libro.</p>
                ) : (
                    <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                        {publicReviews.map((r) => (
                            <div
                                key={r.id}
                                style={{
                                    border: "1px solid #eee",
                                    borderRadius: 10,
                                    padding: 10,
                                    background: "white",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                    <div style={{ fontWeight: 700 }}>{r.authorLabel || "Anónimo"}</div>
                                    <div style={{ fontSize: 12, opacity: 0.8 }}>⭐ {r.rating || "?"}/5</div>
                                </div>

                                <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{r.text}</div>

                                {r.createdAt && (
                                    <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>
                                        {new Date(r.createdAt).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <hr style={{ margin: "16px 0" }} />
            <h3>Diary</h3>
            <hr style={{ margin: "16px 0" }} />

            <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                <input
                    placeholder="Capítulo / parte (opcional)"
                    value={noteChapter}
                    onChange={(e) => setNoteChapter(e.target.value)}
                    style={{ padding: 8 }}
                />

                <textarea
                    placeholder="Escribe tu nota..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                    style={{ padding: 8, resize: "vertical" }}
                />

                <input
                    placeholder="Frase destacada (opcional)"
                    value={noteQuote}
                    onChange={(e) => setNoteQuote(e.target.value)}
                    style={{ padding: 8 }}
                />

                <button onClick={() => crearNota(book.id)} style={{ padding: 10 }}>
                    Guardar nota
                </button>
            </div>

            {notesLoading ? (
                <p style={{ opacity: 0.7 }}>Cargando notas...</p>
            ) : notes.length === 0 ? (
                <p style={{ opacity: 0.7 }}>Todavía no hay notas para este libro.</p>
            ) : (
                <div style={{ display: "grid", gap: 10 }}>
                    {notes.map((n) => (
                        <div
                            key={n.id}
                            style={{
                                border: "1px solid #eee",
                                borderRadius: 10,
                                padding: 10,
                                background: "white",
                            }}
                        >
                            {editingNoteId === n.id ? (
                                <div style={{ display: "grid", gap: 8 }}>
                                    <input
                                        value={editChapter}
                                        onChange={(e) => setEditChapter(e.target.value)}
                                        placeholder="Capítulo / parte (opcional)"
                                        style={{ padding: 8 }}
                                    />

                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        rows={4}
                                        style={{ padding: 8, resize: "vertical" }}
                                    />

                                    <input
                                        value={editQuote}
                                        onChange={(e) => setEditQuote(e.target.value)}
                                        placeholder="Frase destacada (opcional)"
                                        style={{ padding: 8 }}
                                    />

                                    <div style={{ display: "flex", gap: 8 }}>
                                        <button
                                            onClick={() => guardarEdicionNota(n.id)}
                                            style={{ padding: "6px 10px" }}
                                        >
                                            ✅ Guardar
                                        </button>
                                        <button
                                            onClick={cancelarEditarNota}
                                            style={{ padding: "6px 10px" }}
                                        >
                                            ✖ Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {n.chapter && (
                                        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                                            {n.chapter}
                                        </div>
                                    )}

                                    <div style={{ whiteSpace: "pre-wrap" }}>{n.text}</div>

                                    {n.quote && (
                                        <div style={{ marginTop: 8, fontStyle: "italic", opacity: 0.8 }}>
                                            “{n.quote}”
                                        </div>
                                    )}

                                    {n.createdAt && (
                                        <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>
                                            {new Date(n.createdAt).toLocaleString()}
                                        </div>
                                    )}

                                    <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                                        <button
                                            onClick={() => empezarEditarNota(n)}
                                            style={{ padding: "6px 10px" }}
                                        >
                                            ✏️ Editar
                                        </button>
                                        <button
                                            onClick={() => borrarNota(n.id)}
                                            style={{ padding: "6px 10px" }}
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
    const [reviewRating, setReviewRating] = useState("");
    const [reviewIsPublic, setReviewIsPublic] = useState(false);
    const [reviewIsAnonymous, setReviewIsAnonymous] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [publicReviews, setPublicReviews] = useState([]);
    const [publicReviewsLoading, setPublicReviewsLoading] = useState(false);
    const [myReview, setMyReview] = useState(null);


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
                setReviewRating("");
                setReviewIsPublic(false);
                setReviewIsAnonymous(true);
                return;
            }

            setMyReview(data);
            setReviewText(data.text || "");
            setReviewRating(data.rating ? String(data.rating) : "");
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
            setReviewRating(data.rating ? String(data.rating) : reviewRating);

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

    // sección shelf con portadas
    const Section = ({ title, items }) => (
        <div>
            {/* título de la sección */}
            <h2>{title}</h2>
            {/* si no hay libros --> mostramos texto */}
            {items.length === 0 ? (
                <p style={{ opacity: 0.7 }}>No hay libros aquí todavía</p>
            ) : (
                // grid con portadas
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
                        gap: 12,
                    }}
                >
                    {items.map((book) => (
                        <div key={book.id} style={{ textAlign: "center", width: 130,margin: "0 auto", overflow: "visible", }}>
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
                                        borderRadius: 10,
                                        border: "1px solid #eee",
                                        cursor: "pointer",
                                    }}
                                />
                            ) : (
                                // placeholder cuando no portada
                                <div
                                    onClick={() => setSelectedBook(book)}
                                    style={{
                                        width: "100%",
                                        aspectRatio: "2 / 3",
                                        background: "#f0f0f0",
                                        borderRadius: 10,
                                        border: "1px solid #eee",
                                        cursor: "pointer",
                                    }}
                                />
                            )}
                            {/* texto debajo de la portada */}
                            <div style={{ fontSize: 12 }}>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {book.title}
                                </div>
                                <div
                                    style={{
                                        opacity: 0.7,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {book.author}
                                </div>
                            </div>
                            <div style={{ marginTop: 6, display: "flex", flexDirection:"column", justifyContent: "center" }}>
                                {/* selector de estado */}
                                {/* flexDirection: "column" --> uno debajo del otro */}
                                <select
                                    value={book.status || "to_read"}
                                    onChange={(e) => cambiarEstado(book.id, e.target.value)}
                                    style={{ fontSize: 12, padding: 6, width: "100%", minWidth: 130, boxSizing: "border-box"}}
                                >
                                    <option value="to_read">Want to read</option>
                                    <option value="reading">Currently reading</option>
                                    <option value="paused">Interrupted</option>
                                    <option value="finished">Finished</option>
                                </select>

                                {/* botón borrar */}
                                <button
                                    onClick={() => borrarLibro(book.id)}
                                    style={{
                                        fontSize: 12,
                                        padding: "4px 6px",
                                        borderRadius: 6,
                                        border: "1px solid #ddd",
                                        background: "white",
                                        cursor: "pointer",
                                    }}
                                    title="Borrar libro"
                                >
                                    🗑️
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // añadir resultado de búsqueda eligiendo en que shelf colocar
    const addFromResult = async (doc, status) => {
        try {
            const token = await auth.currentUser.getIdToken();

            const title = doc.title || "Sin título";
            const author = (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : "";

            const coverUrl = doc.cover_i
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                : "";
            // enviamos el libro al backend para guardar en Firestore
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    author,
                    status, // elegido (to_read/reading/paused)
                    tags: ["biblioteca"], // para luego estanterías personalizadas
                    genres: doc.subject ? doc.subject.slice(0, 3) : [], // limitar a 3 géneros
                    cover: {
                        source: "openlibrary",
                        url: coverUrl,
                        openLibraryCoverId: doc.cover_i || null,
                    },
                }),
            });

            const data = await res.json();
            // si hay error backend
            if (!res.ok) {
                alert(data.error || "Error al añadir libro");
                return;
            }

            alert(`Añadido (id: ${data.id})`); // luego lo quitaré
            listarLibros(); // recargar biblioteca
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
        if (user) listarLibros();
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
            />
        );
    }

    return (
        <div>
            <h1>ReadRoom</h1>
            <p>Sesión iniciada: {user.email}</p> {/* luego cambiar por nickname o algo así */}
            <button onClick={probarMe}>Probar /api/me</button>
            <button onClick={listarLibros}>Listar mis libros</button>
            <hr />

            <h2>Buscar libros</h2>

            <div style={{ display: "flex"}}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: Harry Potter"
                    style={{ flex: 1, padding: 8 }}
                />
                <button onClick={buscarLibros}>
                    {/* cambiamos el texto del botón si está buscando */}
                    {searching ? "Buscando..." : "Buscar"}
                </button>
            </div>

            {/* lista de resultados de Open Library */}
            {results.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {results.map((doc) => {
                        // portada "M" (mediana) para mostrar en resultados
                        const cover = doc.cover_i
                            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                            : null;

                        const author = (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : "Autor desconocido";

                        return (
                            <li key={doc.key} style={{ display: "flex", gap: 12, padding: 8, borderBottom: "1px solid #ddd" }}>
                                {/* portada o placeholder */}
                                {cover ? (
                                    <img
                                        src={cover}
                                        alt="Portada"
                                        style={{ width: 60, height: 90, objectFit: "cover", borderRadius: 6 }}
                                    />
                                ) : (
                                    <div style={{ width: 60, height: 90, background: "#eee", borderRadius: 6 }} />
                                )}

                                <div style={{ flex: 1 }}>
                                    <div><strong>{doc.title}</strong></div>
                                    <div style={{ opacity: 0.8 }}>{author}</div>
                                    {/* selector --> elegir shelf donde añadir el libro */}
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <span style={{ fontWeight: 600 }}>Add</span>

                                        <select
                                            defaultValue=""
                                            onChange={(e) => {
                                                const status = e.target.value; // shelf elegida
                                                if (!status) return;
                                                addFromResult(doc, status); // añadimos libro
                                                e.target.value = ""; // vuelve a "Add" después de añadir
                                            }}
                                            style={{ padding: 6 }}
                                        >
                                            <option value="">Choose shelf…</option>
                                            <option value="to_read">Want to read</option>
                                            <option value="reading">Currently reading</option>
                                            <option value="paused">Interrupted</option>
                                        </select>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <h2>Library</h2>

            <Section title="Currently reading" items={currentlyReading} />
            <Section title="Want to read" items={wantToRead} />
            <Section title="Interrupted" items={interrupted} />

            <hr />
            <button onClick={() => signOut(auth)}>Cerrar sesión</button>
        </div>
    );
}
