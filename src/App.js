// useEffect: ejecutar code auto
// useState: guardar datos y actualizar estado
import { useEffect, useState } from "react";
// Funciones firebase:
// onAuthStateChanged: ver si hay un usuario logeado o no
// signOut: cierra sesión usuario
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // config de firebase
import AuthPage from "./AuthPage"; // login

export default function App() {
    const [user, setUser] = useState(null); // guardamos user autenticado
    const [loading, setLoading] = useState(true); // controlar si aun estamos comprobando la sesión (T: cargando; F: sabemos si hay)
    const [books, setBooks] = useState([]); // lista de libros usuario
    const [query, setQuery] = useState("");        // texto que escribe el usuario
    const [results, setResults] = useState([]);    // resultados de la búsqueda
    const [searching, setSearching] = useState(false); // para mostrar “buscando...”

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
        listarLibros(); // refrescamos biblioteca
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

            listarLibros(); // refrescar biblioteca
        } catch (e) {
            alert("Error al borrar el libro");
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
                                    style={{
                                        width: "100%",
                                        aspectRatio: "2 / 3",
                                        objectFit: "cover",
                                        borderRadius: 10,
                                        border: "1px solid #eee",
                                    }}
                                />
                            ) : (
                                // placeholder cuando no portada
                                <div
                                    style={{
                                        width: "100%",
                                        aspectRatio: "2 / 3",
                                        background: "#f0f0f0",
                                        borderRadius: 10,
                                        border: "1px solid #eee",
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


    if (loading) return <p>Cargando...</p>; // si aun comprobando sesión
    if (!user) return <AuthPage />; // no usuario logueado
    // si hay usuario logueado --> página
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
