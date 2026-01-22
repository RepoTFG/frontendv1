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
            <h2 style={{color: "red"}}>ESTOY EN EL APP NUEVO</h2>

            <h1>ReadRoom</h1>
            <p>Sesión iniciada: {user.email}</p>
            <button onClick={probarMe}>Probar /api/me</button>
            <button onClick={() => signOut(auth)}>Cerrar sesión</button>
        </div>
    );
}
