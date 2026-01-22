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
    // crear libro de prueba (POST /api/books)
    const crearLibroDemo = async () => {
        try {
            const token = await auth.currentUser.getIdToken();

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/books`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: "Libro de prueba",
                    author: "Autor X",
                    status: "to_read",
                }),
            });

            const data = await res.json();
            alert(`Libro creado con id: ${data.id}`);
        } catch (e) {
            alert("Error al crear el libro");
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
            console.log("Mis libros:", data);
            alert(`Tienes ${data.length} libros (míralos en consola)`);
        } catch (e) {
            alert("Error al listar los libros");
        }
    };




    useEffect(() => {
        // escuchamos los cambios de sesión (se ejecuta cada vez que se inicia o cierra sesión)
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u); // guardamos usuario
            setLoading(false); // ya hemos terminado de comprobar sesuón
        });
        return () => unsub();
    }, []);

    if (loading) return <p>Cargando...</p>; // si aun comprobando sesión
    if (!user) return <AuthPage />; // no usuario logueado
    // si hay usuario logueado --> página
    return (

        <div>

            <h1>ReadRoom</h1>
            <p>Sesión iniciada: {user.email}</p>
            <button onClick={probarMe}>Probar /api/me</button>
            <button onClick={crearLibroDemo}>Crear libro demo</button>
            <button onClick={listarLibros}>Listar mis libros</button>
            <button onClick={() => signOut(auth)}>Cerrar sesión</button>
        </div>
    );
}
