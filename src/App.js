// useEffect: ejecutar code auto
// useState: guardar datos y actualizar estado
import { useEffect, useMemo, useState } from "react";
// Funciones firebase:
// onAuthStateChanged: ver si hay un usuario logeado o no
// signOut: cierra sesión usuario
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // config de firebase
import AuthPage from "./AuthPage"; // login

// components:
import BookDetail from "./components/BookDetail";
import TopBar from "./components/TopBar";
import BottomNav from "./components/BottomNav";

// services:
// importo las llamadas al backend
import { api } from "./services/api";

// screens:
import Home from "./screens/Home";
import Library from "./screens/Library";
import Diary from "./screens/Diary";
import Discover from "./screens/Discover";
import Room from "./screens/Room";

import SplashScreen from "./components/SplashScreen";

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
    // mood:
    // mood de la nueva nota (opcional)
    const [noteMood, setNoteMood] = useState("");
    // mood al editar una nota
    const [editMood, setEditMood] = useState("");
    // book of the Day
    const [bookOfDay, setBookOfDay] = useState(null);
    const [bookOfDayLoading, setBookOfDayLoading] = useState(false);
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
        paddingBottom: 92, // espacio para bottom nav
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

    // hago objeto styles para luego usarlo en components
    const styles = {
        ACCENT,
        SOFT,
        CARD,
        BORDER,
        MUTED,
        container,
        smallGhostBtn
    };

    // probar /api/me (manda token al backend)
    //const probarMe = async () => {
    //    try {
    //        const token = await auth.currentUser.getIdToken();
    //        const data = await api.me(token);
    //        alert(`UID: ${data.uid}\nEmail: ${data.email}`);
    //        alert(e.message || "Error al comprobar el usuario");
    //    }
    //};

    // listar libros (GET /api/books)
    const listarLibros = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const data = await api.listBooks(token);
            setBooks(Array.isArray(data) ? data : []);
        } catch (e) {
            alert(e.message || "Error al listar los libros");
            setBooks([]);
        }
    };

    // búsqueda de libros mediante Open Library (API)
    const buscarLibros = async () => {
        const q = query.trim();
        if (!q) return;

        setSearching(true);
        try {
            const data = await api.searchOpenLibrary(q); // ahora también búsqueda por autor e ISBN
            setResults(data.docs || []);
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
    // ahora en vez de customShelves asumir que son strings --> ahora objetos
    // shelf personalizada
    const customShelfNames = (Array.isArray(customShelves) ? customShelves : []).map((s) =>
        typeof s === "string" ? s : s.name
    );

    // shelf personalizada
    const customSections = customShelfNames.map((name) => ({
        name,
        items: (Array.isArray(books) ? books : []).filter(
            (b) => Array.isArray(b.shelves) && b.shelves.includes(name)
        ),
    }));


    // crear shelf personalizada --> usado en botón onClick "+ Crear"
    const crearShelf = async () => {
        const name = newShelfName.trim();
        if (!name) return;

        try {
            const token = await auth.currentUser.getIdToken();

            await api.createShelf(token, { name });

            setNewShelfName("");
            listarShelves(); // refrescamos la lista desde db
        } catch (e) {
            alert(e.message || "Error al crear shelf");
        }
    };
    const borrarShelf = async (shelf) => {
        if (!shelf?.id || typeof shelf.id !== "string" || shelf.id.length !== 24) {
            alert("No se pudo eliminar: falta el id de la shelf (revisa listarShelves).");
            return;
        }

        if (!window.confirm(`¿Eliminar la shelf "${shelf.name}"?`)) return;

        try {
            const token = await auth.currentUser.getIdToken();
            await api.deleteShelf(token, shelf.id);
            listarShelves();
        } catch (e) {
            alert(e.message || "Error al eliminar shelf");
        }
    };


    // cambiar estado libro (PATCH /api/books/:id)
    const cambiarEstado = async (id, status) => {
        try {
            const token = await auth.currentUser.getIdToken();
            await api.patchBook(token, id, { status });
            // actualiza el libro seleccionado si coincide
            setSelectedBook((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
            listarLibros();
        } catch (e) {
            alert(e.message || "Error al cambiar estado");
        }
    };

    // borrar un libro (DELETE /api/books/:id)
    const borrarLibro = async (id) => {
        const ok = window.confirm("¿Seguro que quieres borrar este libro?");
        if (!ok) return;

        try {
            const token = await auth.currentUser.getIdToken();
            await api.deleteBook(token, id);

            setSelectedBook((prev) => (prev && prev.id === id ? null : prev));
            listarLibros();
        } catch (e) {
            alert(e.message || "Error al borrar el libro");
        }
    };

    const cargarNotas = async (bookId) => {
        setNotesLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const data = await api.listNotes(token, bookId);
            setNotes(Array.isArray(data) ? data : []);
        } catch (e) {
            alert(e.message || "Error al cargar notas");
            setNotes([]);
        } finally {
            setNotesLoading(false);
        }
    };

    const crearNota = async (bookId) => {
        const text = noteText.trim();
        if (!text) return alert("Escribe una nota primero");

        try {
            const token = await auth.currentUser.getIdToken();
            await api.createNote(token, bookId, {
                chapter: noteChapter.trim(),
                text,
                quote: noteQuote.trim(),
                mood: noteMood || "",
            });
            // limpiar form
            setNoteText("");
            setNoteChapter("");
            setNoteQuote("");
            setNoteMood("");
            cargarNotas(bookId); // recargar notas
        } catch (e) {
            alert(e.message || "Error al guardar la nota");
        }
    };
    const borrarNota = async (noteId) => {
        console.log("Intentando borrar nota:", noteId);
        const ok = window.confirm("¿Seguro que quieres borrar esta nota?");
        if (!ok) return;

        try {
            const token = await auth.currentUser.getIdToken();
            await api.deleteNote(token, noteId);

            if (selectedBook && !selectedBook._discoverPreview) cargarNotas(selectedBook.id);
        } catch (e) {
            alert(e.message || "Error al borrar la nota");
        }
    };

    const empezarEditarNota = (note) => {
        setEditingNoteId(note.id);
        setEditText(note.text || "");
        setEditChapter(note.chapter || "");
        setEditQuote(note.quote || "");
        setEditMood(note.mood || "");
    };

    const cancelarEditarNota = () => {
        setEditingNoteId(null);
        setEditText("");
        setEditChapter("");
        setEditQuote("");
        setEditMood("");
    };

    const guardarEdicionNota = async (noteId) => {
        const text = editText.trim();
        if (!text) return alert("El texto no puede estar vacío");

        try {
            const token = await auth.currentUser.getIdToken();
            await api.patchNote(token, noteId, {
                text,
                chapter: editChapter.trim(),
                quote: editQuote.trim(),
                mood: editMood || "",
            });
            // refrescar y salir del modo edición
            if (selectedBook && !selectedBook._discoverPreview) await cargarNotas(selectedBook.id);
            cancelarEditarNota();
        } catch (e) {
            alert(e.message || "Error al editar la nota");
        }
    };
    // book of the day
    const cargarBookOfDay = async () => {
        try {
            setBookOfDayLoading(true); // mostramos cargando
            const token = await auth.currentUser.getIdToken();
            const data = await api.getBookOfDay(token); // obtenemos recomendación
            console.log("book of day response:", data);
            setBookOfDay(data); // guardamos libro para luego en discover mostrar título, autor y cover
        } catch (e) {
            console.error(e);
        } finally {
            setBookOfDayLoading(false);
        }
    };
    // review
    // cargar reseña propia (GET /api/books/:bookId/review)
    const cargarReview = async (bookId) => {
        setReviewLoading(true);
        try {
            const token = await auth.currentUser.getIdToken();
            const data = await api.getMyReview(token, bookId);

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
            alert(e.message || "Error al cargar reseña");
        } finally {
            setReviewLoading(false);
        }
    };
    // guardar reseña (PUT /api/books/:bookId/review)
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

            const data = await api.putMyReview(token, bookId, payload);

            setMyReview(data);
            setReviewIsPublic(!!data.isPublic);
            setReviewIsAnonymous(data.isAnonymous !== false);
            setReviewRating(data.rating ? Number(data.rating) : reviewRating);

            alert(overrides.isPublic ? "Reseña publicada" : "Reseña guardada");
        } catch (e) {
            alert(e.message || "Error al guardar reseña");
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

    // cargar reseñas públicas (GET /api/reviews/public?bookId=...)
    const cargarResenasPublicas = async (bookId) => {
        setPublicReviewsLoading(true);
        try {
            const data = await api.getPublicReviews(bookId);
            setPublicReviews(Array.isArray(data) ? data : []);
        } catch (e) {
            alert(e.message || "Error al cargar reseñas públicas");
            setPublicReviews([]);
        } finally {
            setPublicReviewsLoading(false);
        }
    };

    // shelves personalizadas (GET /api/shelves)
    const listarShelves = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const data = await api.listShelves(token);

            // ahora objeto (data) [{id, name, ...}]
            const normalized = (Array.isArray(data) ? data : []).map((s) => ({
                id: s.id || s._id,
                name: s.name,
            }));

            setCustomShelves(normalized);
        } catch (e) {
            alert(e.message || "Error listando shelves");
            setCustomShelves([]);
        }
    };



    // cambiar shelf (PATCH /api/books/:id)
    const cambiarShelf = async (id, shelf) => {
        try {
            const token = await auth.currentUser.getIdToken();
            await api.patchBook(token, id, { shelf });
            // si elijo shelf, quito status --> por ello, lo dejo en to_read para no romper nada
            setSelectedBook((prev) => (prev && prev.id === id ? { ...prev, shelf } : prev));
            listarLibros();
        } catch (e) {
            alert(e.message || "Error al cambiar shelf");
        }
    };

    // toggle shelf en libro (POST /api/books/:bookId/shelves/toggle)
    const toggleBookShelf = async (bookId, shelfName) => {
        try {
            const token = await auth.currentUser.getIdToken();
            const data = await api.toggleBookShelf(token, bookId, { shelf: shelfName });

            if (data && data.id) {
                setSelectedBook((prev) => (prev && prev.id === bookId ? { ...prev, ...data } : prev));
            }

            listarLibros();
        } catch (e) {
            alert(e.message || "Error al actualizar shelves del libro");
        }
    };

    // añadir resultado de búsqueda eligiendo en que shelf colocar
    const addFromResult = async (doc, { status, shelves } = {}) => {
        try {
            const token = await auth.currentUser.getIdToken();

            // comprobamos si el libro ya existe en la biblioteca
            // primero intentamos por openLibraryCoverId
            const existingByCover = doc.cover_i
                ? books.find((b) => b?.cover?.openLibraryCoverId === doc.cover_i)
                : null;

            // fallback: título + autor
            const titleNormalized = (doc.title || "").trim().toLowerCase();
            const authorNormalized = (
                (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : ""
            )
                .trim()
                .toLowerCase();

            const existingByText = books.find((b) => {
                const bt = (b.title || "").trim().toLowerCase();
                const ba = (b.author || "").trim().toLowerCase();
                return bt === titleNormalized && ba === authorNormalized;
            });

            const existingBook = existingByCover || existingByText;

            // si ya existe --> actualizamos, no crear duplicado
            if (existingBook) {
                // si viene de status y es distinto --> actualizamos status
                if (typeof status === "string" && existingBook.status !== status) {
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

            // si no existe --> crear libro nuevo
            const title = doc.title || "Sin título";
            const author =
                (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : "";

            const coverUrl = doc.cover_i
                ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
                : "";

            // si se elige shelf personalizada y no viene status
            const finalStatus = typeof status === "string" ? status : "";

            const work = await api.getOpenLibraryWork(doc.key); // doc.key tipo "/works/OLxxxxW"
            // ahora genres vienen de work (API) no de doc.subject
            const genresFromWork = Array.isArray(work?.subjects)
                ? work.subjects.slice(0, 5)
                : [];

            // antes era fetch POST /api/books --> ahora api.createBook
            await api.createBook(token, {
                title,
                author,
                status: finalStatus,
                shelves: Array.isArray(shelves) ? shelves : [],
                tags: ["biblioteca"], // como prueba de uso, luego se podría aplicar un uso útil
                genres: genresFromWork,
                cover: {
                    source: "openlibrary",
                    url: coverUrl,
                    openLibraryCoverId: doc.cover_i || null,
                },
                openLibrary: {
                    workKey: typeof doc.key === "string" ? doc.key : "",
                    authorKey:
                        Array.isArray(doc.author_key) && doc.author_key[0]
                            ? `/authors/${doc.author_key[0]}`
                            : "",
                },

            });

            listarLibros();
        } catch (e) {
            alert(e.message || "Error al añadir el libro");
        }
    };

    // añadir libro desde preview de discover/reviews
    const addFromPreview = async (book, { status, shelves } = {}) => {
        try {
            const token = await auth.currentUser.getIdToken();

            const existingByText = books.find((b) => {
                const bt = (b.title || "").trim().toLowerCase();
                const ba = (b.author || "").trim().toLowerCase();
                return (
                    bt === (book.title || "").trim().toLowerCase() &&
                    ba === (book.author || "").trim().toLowerCase()
                );
            });

            if (existingByText) {
                if (typeof status === "string" && existingByText.status !== status) {
                    await cambiarEstado(existingByText.id, status);
                }

                if (Array.isArray(shelves) && shelves.length > 0) {
                    for (const s of shelves) {
                        const hasShelf =
                            Array.isArray(existingByText.shelves) &&
                            existingByText.shelves.includes(s);

                        if (!hasShelf) {
                            await toggleBookShelf(existingByText.id, s);
                        }
                    }
                }

                await listarLibros();
                setSelectedBook((prev) => (prev && prev._discoverPreview ? { ...existingByText } : prev));
                return;
            }

            await api.createBook(token, {
                title: book.title || "Sin título",
                author: book.author || "",
                status: typeof status === "string" ? status : "",
                shelves: Array.isArray(shelves) ? shelves : [],
                tags: ["biblioteca"],
                genres: [],
                cover: {
                    source: "openlibrary",
                    url: book.cover?.url || "",
                    openLibraryCoverId: book.cover?.openLibraryCoverId || null,
                },
                openLibrary: {
                    workKey: book.openLibrary?.workKey || "",
                    authorKey: book.openLibrary?.authorKey || "",
                },
            });

            await listarLibros();

            const refreshed = await api.listBooks(token);
            const nextBooks = Array.isArray(refreshed) ? refreshed : [];
            const added = nextBooks.find((b) => {
                const bt = (b.title || "").trim().toLowerCase();
                const ba = (b.author || "").trim().toLowerCase();
                return (
                    bt === (book.title || "").trim().toLowerCase() &&
                    ba === (book.author || "").trim().toLowerCase()
                );
            });

            if (added) {
                setSelectedBook(added);
            }
        } catch (e) {
            alert(e.message || "Error al añadir el libro");
        }
    };

    useEffect(() => {
        const start = Date.now(); // momento en que arranca la app

        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);

            const elapsed = Date.now() - start;
            const MIN_TIME = 600; // tiempo mínimo de splash
            const remaining = MIN_TIME - elapsed;

            if (remaining > 0) {
                setTimeout(() => setLoading(false), remaining);
            } else {
                setLoading(false);
            }
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
        if (activeTab === "discover" && user) {
            cargarBookOfDay();
        }
    }, [activeTab, user]);

    useEffect(() => {
        if (selectedBook) {
            // cuando se abre el detalle de un libro → cargar sus notas
            if (!selectedBook._discoverPreview) {
                cargarNotas(selectedBook.id);
                cargarReview(selectedBook.id);
            } else {
                setNotes([]);
                setNoteText("");
                setNoteChapter("");
                setNoteQuote("");
                setMyReview(null);
                setReviewText("");
                setReviewRating(5);
                setReviewIsPublic(false);
                setReviewIsAnonymous(true);
                setPublicReviews([]);
            }
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

    // if (loading) return <p>Cargando...</p>; // si aun comprobando sesión
    if (loading) {
        return <SplashScreen />;
    }
    if (!user) return <AuthPage />; // no usuario logueado

    // si hay usuario logueado --> página
    if (selectedBook) {
        return (
            <BookDetail
                book={selectedBook}
                user={user}
                onBack={() => {
                    setSelectedBook(null);
                    cancelarEditarNota();
                }}
                cambiarEstado={cambiarEstado}
                cambiarShelf={cambiarShelf}
                customShelves={customShelfNames} //solo los nombres
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
                noteMood={noteMood}
                setNoteMood={setNoteMood}
                editMood={editMood}
                setEditMood={setEditMood}
                addFromPreview={addFromPreview}
                // al volver atrás, contador de relecturas también actualizado:
                onBookUpdated={(bookId, changes) => {
                    setBooks((prev) =>
                        prev.map((b) =>
                            b.id === bookId ? { ...b, ...changes } : b // si encontramos libro correcto = crear uno con los cambios
                        )
                    );
                    setSelectedBook((prev) =>
                        prev && prev.id === bookId ? { ...prev, ...changes } : prev // actualizar vista libro
                    );
                }}
            />
        );
    }

    return (
        <div style={pageWrap}>
            <TopBar
                title={topBarTitle}
                onLogout={() => signOut(auth)}
                styles={styles}
            />

            <div style={container}>
                {activeTab === "home" && (
                    <Home
                        results={results}
                        searching={searching}
                        query={query}
                        setQuery={setQuery}
                        customShelves={customShelves}
                        addStatusByKey={addStatusByKey}
                        setAddStatusByKey={setAddStatusByKey}
                        books={books}
                        finished={finished}
                        currentlyReading={currentlyReading}
                        buscarLibros={buscarLibros}
                        addFromResult={addFromResult}
                        toggleBookShelf={toggleBookShelf}
                        setSelectedBook={setSelectedBook}
                        setActiveTab={setActiveTab}
                        styles={styles}
                        inputStyle={inputStyle}
                        primaryBtn={primaryBtn}
                        SOFT={SOFT}
                        BORDER={BORDER}
                        CARD={CARD}
                        ACCENT={ACCENT}
                        MUTED={MUTED}
                    />
                )}
                {activeTab === "library" && (
                    <Library
                        currentlyReading={currentlyReading}
                        wantToRead={wantToRead}
                        interrupted={interrupted}
                        finished={finished}
                        customSections={customSections}
                        setSelectedBook={setSelectedBook}
                        styles={styles}
                        customShelves={customShelves}
                        borrarShelf={borrarShelf}
                        newShelfName={newShelfName}
                        setNewShelfName={setNewShelfName}
                        crearShelf={crearShelf}
                        inputStyle={inputStyle}
                        primaryBtn={primaryBtn}

                    />
                )}

                {activeTab === "diary" && (
                    <Diary books={books} setSelectedBook={setSelectedBook} styles={styles} />

                )}

                {activeTab === "discover" && (
                    <Discover
                        BORDER={BORDER}
                        CARD={CARD}
                        ACCENT={ACCENT}
                        MUTED={MUTED}
                        ghostBtn={ghostBtn}
                        bookOfDay={bookOfDay}
                        bookOfDayLoading={bookOfDayLoading}
                        books={books}
                        customShelves={customShelves}
                        addFromResult={addFromResult}
                        toggleBookShelf={toggleBookShelf}
                        setSelectedBook={setSelectedBook}
                    />
                )}

                {activeTab === "room" && (
                    <Room
                        user={user}
                        newShelfName={newShelfName}
                        setNewShelfName={setNewShelfName}
                        customShelves={customShelves}
                        crearShelf={crearShelf}
                        inputStyle={inputStyle}
                        primaryBtn={primaryBtn}
                        styles={styles}
                    />
                )}
            </div>


            <BottomNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                styles={styles}
            />
        </div>
    );
}