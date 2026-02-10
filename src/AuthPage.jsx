import { useState } from "react";
import { auth } from "./firebase";
import {
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";

export default function AuthPage() {
    // estilos
    const ACCENT = "#2F2A24";
    const SOFT = "#F6F3EF";
    const CARD = "#FFFFFF";
    const BORDER = "#E9E4DE";
    const MUTED = "rgba(47,42,36,0.60)";
    const BG = "#FBFAF8";

    const [mode, setMode] = useState("login"); // login o register
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const inputStyle = {
        padding: 12,
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: SOFT,
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        fontSize: 14,
        color: ACCENT,
    };

    const primaryBtn = {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${ACCENT}`,
        background: ACCENT,
        color: "white",
        cursor: "pointer",
        width: "100%",
        fontWeight: 900,
    };

    const ghostBtn = {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: CARD,
        color: ACCENT,
        cursor: "pointer",
        width: "100%",
        fontWeight: 900,
    };

    const tabBtn = (active) => ({
        flex: 1,
        padding: "10px 12px",
        borderRadius: 14,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? SOFT : CARD,
        color: ACCENT,
        cursor: "pointer",
        fontWeight: 900,
    });

    // login con Google
    const loginGoogle = async () => {
        setError("");
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // registro
    const registerEmail = async () => {
        setError("");
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // login con Email
    const loginEmail = async () => {
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrimary = () => {
        if (mode === "register") return registerEmail();
        return loginEmail();
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: BG,
                display: "flex",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <div style={{ width: "100%", maxWidth: 520, marginTop: 28 }}>
                {/* cabecera */}
                <div style={{ marginBottom: 14, padding: "0 4px" }}>
                    <div style={{ fontWeight: 1000, color: ACCENT, fontSize: 28, letterSpacing: -0.5 }}>
                        ReadRoom
                    </div>
                    <div style={{ marginTop: 6, color: MUTED, fontWeight: 700, lineHeight: 1.4 }}>
                        {mode === "login"
                            ? "Accede a tu biblioteca y tu diario."
                            : "Crea tu cuenta para empezar tu Readroom."}
                    </div>
                </div>

                {/* tabs */}
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <button type="button" onClick={() => setMode("login")} style={tabBtn(mode === "login")}>
                        Iniciar sesión
                    </button>
                    <button type="button" onClick={() => setMode("register")} style={tabBtn(mode === "register")}>
                        Crear cuenta
                    </button>
                </div>

                {/* card */}
                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 22,
                        background: CARD,
                        padding: 16,
                        boxShadow: "0 10px 30px rgba(47,42,36,0.06)",
                    }}
                >
                    <div style={{ display: "grid", gap: 10 }}>
                        <button type="button" onClick={loginGoogle} style={ghostBtn} disabled={loading}>
                            Continuar con Google
                        </button>

                        {/* separador */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ height: 1, background: BORDER, flex: 1 }} />
                            <div style={{ fontSize: 12, color: MUTED, fontWeight: 800 }}>o</div>
                            <div style={{ height: 1, background: BORDER, flex: 1 }} />
                        </div>

                        <div style={{ fontSize: 12, color: MUTED, fontWeight: 900 }}>Email</div>
                        <input
                            placeholder="tuemail@ejemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={inputStyle}
                            autoComplete="email"
                        />

                        <div style={{ fontSize: 12, color: MUTED, fontWeight: 900, marginTop: 6 }}>Contraseña</div>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={inputStyle}
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                        />

                        <button type="button" onClick={handlePrimary} style={primaryBtn} disabled={loading}>
                            {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
                        </button>

                        {error && (
                            <div
                                style={{
                                    marginTop: 6,
                                    border: `1px solid ${BORDER}`,
                                    background: SOFT,
                                    borderRadius: 14,
                                    padding: 12,
                                    color: ACCENT,
                                    fontWeight: 800,
                                    fontSize: 13,
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {error}
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
}
