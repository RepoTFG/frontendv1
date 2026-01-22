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
            <button onClick={() => signOut(auth)}>Cerrar sesión</button>
        </div>
    );
}
