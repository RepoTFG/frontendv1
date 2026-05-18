import { useEffect, useMemo, useState } from "react";
import AmbientPlayer from "../components/AmbientPlayer";

export default function Room({
                                 user,
                                 styles,
                             }) {
    const { SOFT, BORDER, CARD, ACCENT, MUTED } = styles;

    const TIMES = [15, 25, 45]; // tiempos de sesión
    const [selectedAtmosphere, setSelectedAtmosphere] = useState("rain"); // o forest o fireplace
    const [selectedMinutes, setSelectedMinutes] = useState(25); // duración sesión

    const [sessionActive, setSessionActive] = useState(false);
    const [sessionFinished, setSessionFinished] = useState(false);
    const [sessionStarted, setSessionStarted] = useState(false); // para evitar bug de que aparezca un "flash" del timer
    const [secondsLeft, setSecondsLeft] = useState(25 * 60); // tiempo restante (s)

    // sonido
    const [soundMode, setSoundMode] = useState("default"); //  upload o spotify
    // local
    const [localUrl, setLocalUrl] = useState("");
    // spotify
    const [spotifyInput, setSpotifyInput] = useState("");
    const [spotifyUrl, setSpotifyUrl] = useState(""); // embed
    // timer de la sesión
    useEffect(() => {
        if (!sessionActive) return; // si sesión está activa

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) { // cuando llega a 0 --> terminar sesión
                    clearInterval(timer);
                    setSessionActive(false);
                    setSessionFinished(true);
                    return 0;
                }
                return prev - 1; // si aún queda tiempo, restamos un segundo
            });
        }, 1000); // cada segundo

        return () => clearInterval(timer); // limpiamos --> no múltiple timers
    }, [sessionActive]);
    // reset timer al cambiar la duración
    useEffect(() => {
        if (!sessionStarted && !sessionActive && !sessionFinished) { // sesión aún no empezada, actualizar tiempo
            setSecondsLeft(selectedMinutes * 60);
        }
    }, [selectedMinutes, sessionStarted, sessionActive, sessionFinished]);
    // mostramos tiempo
    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`; // padStart para formato 00:00
    };
    // convertimos link spotify a embed
    // pasar de https://open.spotify.com/track/123 --> https://open.spotify.com/embed/track/123
    const extractSpotifyEmbedUrl = (url) => {
        const raw = String(url || "").trim(); // limpiar input
        if (!raw) return "";

        try {
            const parsed = new URL(raw);
            const host = parsed.hostname.toLowerCase();

            if (!host.includes("spotify.com")) return ""; // verificamos dominio

            const parts = parsed.pathname.split("/").filter(Boolean);
            const allowedTypes = new Set(["track", "playlist", "album", "episode", "show"]);
            const type = parts[0];
            const id = parts[1];

            if (!allowedTypes.has(type) || !id) return "";

            return `https://open.spotify.com/embed/${type}/${id}`; // creamos embed
        } catch {
            return "";
        }
    };
    // controles de la sesión
    const startSession = () => {
        setSecondsLeft(selectedMinutes * 60);
        setSessionFinished(false);
        setSessionStarted(true);
        setSessionActive(true);
    };

    const pauseSession = () => {
        setSessionActive(false); // detener contador
    };

    const resumeSession = () => {
        if (secondsLeft > 0) setSessionActive(true); // solo reanudar si queda tiempo
    };

    const finishSession = () => {
        setSessionActive(false);
        setSessionStarted(true);
        setSessionFinished(true);
        setSecondsLeft(0);
    };
    // volver estado inicial
    const resetSession = () => {
        setSessionActive(false);
        setSessionFinished(false);
        setSessionStarted(false);
        setSecondsLeft(selectedMinutes * 60);
    };

    const cardStyle = useMemo(() => ({
        border: `1px solid ${BORDER}`,
        borderRadius: 18,
        background: CARD,
        padding: 14,
    }), [BORDER, CARD]);

    const sectionLabel = {
        fontSize: 12,
        color: MUTED,
        fontWeight: 800,
        marginBottom: 8,
    };

    const pill = (active, disabled = false) => ({
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? SOFT : CARD,
        color: ACCENT,
        fontWeight: active ? 900 : 800,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 12,
        opacity: disabled ? 0.45 : 1,
    });

    const softPrimaryBtn = {
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${ACCENT}`,
        background: SOFT,
        color: ACCENT,
        cursor: "pointer",
        fontWeight: 900,
        width: "100%",
    };

    const ghostBtn = {
        padding: "10px 12px",
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: CARD,
        color: ACCENT,
        cursor: "pointer",
        fontWeight: 800,
    };
    // etiqueta sonido actual
    const currentSourceLabel =
        soundMode === "upload" && localUrl
            ? "Local audio"
            : soundMode === "spotify" && spotifyUrl
                ? "Spotify"
                : selectedAtmosphere === "forest"
                    ? "Forest"
                    : selectedAtmosphere === "fireplace"
                        ? "Fireplace"
                        : "Rain";

    return (
        <>

            <div style={{ ...cardStyle, marginTop: 14 }}>
                <div style={{ fontWeight: 900, color: ACCENT, fontSize: 18 }}>
                    Reading ritual
                </div>
                {/* selección sonido */}
                <div style={{ marginTop: 18 }}>
                    <div style={sectionLabel}>Choose your sound</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            onClick={() => setSoundMode("default")}
                            style={pill(soundMode === "default", sessionActive)}
                            disabled={sessionActive}
                        >
                            Default
                        </button>
                        <button
                            type="button"
                            onClick={() => setSoundMode("upload")}
                            style={pill(soundMode === "upload", sessionActive)}
                            disabled={sessionActive}
                        >
                            Upload file
                        </button>
                        <button
                            type="button"
                            onClick={() => setSoundMode("spotify")}
                            style={pill(soundMode === "spotify", sessionActive)}
                            disabled={sessionActive}
                        >
                            Spotify
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: 14 }}>
                    <AmbientPlayer
                        styles={styles}
                        sessionActive={sessionActive}
                        soundMode={soundMode}
                        selectedAtmosphere={selectedAtmosphere}
                        setSelectedAtmosphere={setSelectedAtmosphere}
                        spotifyInput={spotifyInput}
                        setSpotifyInput={setSpotifyInput}
                        spotifyUrl={spotifyUrl}
                        setSpotifyUrl={setSpotifyUrl}
                        localUrl={localUrl}
                        setLocalUrl={setLocalUrl}
                        extractSpotifyEmbedUrl={extractSpotifyEmbedUrl}
                    />
                </div>
                {/* selección de tiempo */}
                <div style={{ marginTop: 18 }}>
                    <div style={sectionLabel}>Set a reading time</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {TIMES.map((mins) => (
                            <button
                                key={mins}
                                type="button"
                                onClick={() => setSelectedMinutes(mins)}
                                style={pill(selectedMinutes === mins, sessionActive)}
                                disabled={sessionActive}
                            >
                                {mins}
                            </button>
                        ))}
                    </div>
                </div>
                {/* botón start session solo aparece si aún no empezó */}
                {!sessionStarted && !sessionActive && !sessionFinished && (
                    <div style={{ marginTop: 18 }}>
                        <button
                            type="button"
                            onClick={startSession}
                            style={softPrimaryBtn}
                        >
                            Start session
                        </button>
                    </div>
                )}
                {/* panel del timer */}
                {sessionStarted && (
                    <div
                        style={{
                            marginTop: 18,
                            paddingTop: 18,
                            borderTop: `1px solid ${BORDER}`,
                        }}
                    >
                        <div style={{ color: MUTED, fontSize: 12, fontWeight: 800 }}>
                            {sessionFinished ? "Session finished" : "Reading session"}
                        </div>

                        <div
                            style={{
                                marginTop: 10,
                                fontSize: 44,
                                fontWeight: 900,
                                color: ACCENT,
                                letterSpacing: 1,
                            }}
                        >
                            {sessionFinished ? "00:00" : formatTime(secondsLeft)}
                        </div>

                        <div style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>
                            {currentSourceLabel} · {selectedMinutes} min
                        </div>

                        {!sessionFinished ? (
                            <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {sessionActive ? (
                                    <button type="button" onClick={pauseSession} style={ghostBtn}>
                                        Pause
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={resumeSession}
                                        style={{
                                            ...ghostBtn,
                                            border: `1px solid ${ACCENT}`,
                                            background: SOFT,
                                            fontWeight: 900,
                                        }}
                                        disabled={secondsLeft <= 0}
                                    >
                                        Resume
                                    </button>
                                )}

                                <button type="button" onClick={finishSession} style={ghostBtn}>
                                    Finish
                                </button>

                                <button type="button" onClick={resetSession} style={ghostBtn}>
                                    Reset
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                                <div style={{ color: MUTED, fontSize: 13 }}>
                                    Has terminado tu sesión de lectura.
                                </div>

                                <button
                                    type="button"
                                    onClick={resetSession}
                                    style={softPrimaryBtn}
                                >
                                    Start a new session
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}