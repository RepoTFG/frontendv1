import { useState } from "react";
import { auth } from "./firebase";
import {
    GoogleAuthProvider, // inicio sesión con Google
    signInWithPopup, // crea popup
    createUserWithEmailAndPassword, // crea cuenta
    signInWithEmailAndPassword, // inicia sesión
} from "firebase/auth";

export default function AuthPage() {
    // guardamos email, password y mensaje de error (si falla algo al loguear o registrar)
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Login con Google
    const loginGoogle = async () => {
        setError(""); // limpiamos error
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider); // si todo bien:  popup inicio sesión
        } catch (e) {
            setError(e.message);
        }
    };
    // Registro
    const registerEmail = async () => {
        setError("");
        try {
            await createUserWithEmailAndPassword(auth, email, password); // creamos cuenta
        } catch (e) {
            setError(e.message);
        }
    };
    // Logic con Email
    const loginEmail = async () => {
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password); // inicio sesión
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div>
            <h2>ReadRoom</h2>

            <button onClick={loginGoogle}>
                Continuar con Google
            </button>

            <hr/>

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                //luego puedo añadir style como --> style={{}}
            />

            <div>
                <button onClick={registerEmail}>Registrarme</button>
                <button onClick={loginEmail}>Entrar</button>
            </div>

            {error && <p>{error}</p>}
        </div>
    );
}
