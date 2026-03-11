import { useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import { api } from "../services/api";

export default function Discover({ BORDER, CARD, ACCENT, MUTED, ghostBtn, bookOfDay, bookOfDayLoading }) {
    // estilos
    const sectionWrap = {
        border: `1px solid ${BORDER}`,
        borderRadius: 18,
        background: CARD,
        padding: 14,
    };
    const title = { fontWeight: 900, color: ACCENT };
    const sub = { marginTop: 6, color: MUTED, fontSize: 13 };
    const divider = { height: 1, background: BORDER, margin: "14px 0" };
    // cambiamos estilos según se seleccione o no
    const pill = (active) => ({
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? ACCENT : "white",
        color: active ? "white" : ACCENT,
        cursor: "pointer",
        fontWeight: 900,
        fontSize: 12,
    });

    const inputStyle = {
        padding: 12,
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: "#F6F3EF",
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        fontSize: 14,
    };

    // top tabs
    const [tab, setTab] = useState("for_you"); // for_you, mood, connect

    const tabs = useMemo(
        () => [
            { key: "for_you", label: "For you" },
            { key: "mood", label: "Mood" },
            { key: "connect", label: "Connect" },
        ],
        []
    );

    // for you (placeholder)
    const bookOfDayData = useMemo(() => {
        const titleText =
            bookOfDay?.book?.title ||
            bookOfDay?.title ||
            "Placeholder: El nombre del libro";

        const authorText =
            bookOfDay?.book?.author ||
            bookOfDay?.author ||
            "Autor/a";

        const coverUrl =
            bookOfDay?.book?.coverUrl ||
            bookOfDay?.coverUrl ||
            "";

        const subtitleText =
            bookOfDay?.reason ||
            bookOfDay?.subtitle ||
            "";

        return {
            title: "Book of the day",
            subtitle: subtitleText,
            book: {
                title: titleText,
                author: authorText,
                coverUrl,
            },
        };
    }, [bookOfDay]);
    // feedback
    const [bookOfDayFeedback, setBookOfDayFeedback] = useState(0); // 1 like, -1 dislike, 0 none
    const [bookOfDayFeedbackLoading, setBookOfDayFeedbackLoading] = useState(false);
    // book of the day AI
    const [bookOfDayAI, setBookOfDayAI] = useState(null);
    const [bookOfDayAILoading, setBookOfDayAILoading] = useState(false);

    const bookOfDayAIData = useMemo(() => {
        const titleText =
            bookOfDayAI?.title ||
            "Placeholder: AI book";

        const authorText =
            bookOfDayAI?.author ||
            "Autor/a";

        const coverUrl =
            bookOfDayAI?.coverUrl ||
            "";

        const subtitleText =
            bookOfDayAI?.reason ||
            "";

        return {
            title: "Book of the day (AI)",
            subtitle: subtitleText,
            book: {
                title: titleText,
                author: authorText,
                coverUrl,
            },
        };
    }, [bookOfDayAI]);
    // cargamos feedback: pidiendo token y llamamos a endpoint GET actualizando el estado
    const loadFeedback = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const data = await api.getBookOfDayFeedback(token);
            setBookOfDayFeedback(data?.value || 0);
        } catch (e) {
            console.error(e);
        }
    };
    // cargamos book of the day AI
    const loadBookOfDayAI = async () => {
        try {
            setBookOfDayAILoading(true);
            const token = await auth.currentUser.getIdToken();
            const data = await api.getBookOfDayAI(token);
            setBookOfDayAI(data || null);
        } catch (e) {
            console.error(e);
            setBookOfDayAI(null);
        } finally {
            setBookOfDayAILoading(false);
        }
    };
    // enviamos feedback: activamos loading, haciendo post al backend (1 o -1) y actualizamos estado
    const sendFeedback = async (value) => {
        try {
            setBookOfDayFeedbackLoading(true);
            const token = await auth.currentUser.getIdToken();
            await api.sendBookOfDayFeedback(token, value);
            setBookOfDayFeedback(value);
        } catch (e) {
            alert(e.message || "Error guardando feedback");
        } finally {
            setBookOfDayFeedbackLoading(false);
        }
    };
    // cuando cambie bookOfDay o Loading, revisamos si ya tiene un libro y que ya no esté cargando
    useEffect(() => {
        if (bookOfDay && !bookOfDayLoading) {
            loadFeedback();
            loadBookOfDayAI();
        }
    }, [bookOfDay, bookOfDayLoading]);

    const moods = useMemo(
        () => [
            { key: "relaxed", label: "Relax" },
            { key: "thoughtful", label: "Thoughtful" },
            { key: "excited", label: "Excited" },
            { key: "anxious", label: "Anxious" },
            { key: "romantic", label: "Romantic" },
            { key: "curious", label: "Curious" },
        ],
        []
    );

    const [moodExpanded, setMoodExpanded] = useState(true); // abre/cierra panel
    const [selectedMood, setSelectedMood] = useState("");
    const [moodText, setMoodText] = useState(""); // texto opcional para que el usuario pueda dar más info

    const [loading, setLoading] = useState(false);
    const [serverMood, setServerMood] = useState("");
    const [blurb, setBlurb] = useState(""); // texto explicativo por cada mood
    const [searchTerms, setSearchTerms] = useState([]); // terms que el backend usa para buscar en OpenLibrary
    const [items, setItems] = useState([]);
    const [error, setError] = useState("");

    // recogemos el mood seleccionado por el user, llamando al backend y recibiendo recomendaciones para actualizar el estado
    const fetchMoodRecs = async ({ mood, moodText } = {}) => {
        setLoading(true);
        setError("");
        try {
            const token = await auth.currentUser.getIdToken();
            // post mood
            const data = await api.discoverMood(token, { mood, moodText, limit: 12 });

            setServerMood(data?.mood || "");
            setBlurb(data?.blurb || "");
            setSearchTerms(Array.isArray(data?.searchTerms) ? data.searchTerms : []);
            setItems(Array.isArray(data?.recommendations) ? data.recommendations : []);
        } catch (e) {
            setError(e.message || "Error cargando recomendaciones");
            setServerMood("");
            setBlurb("");
            setSearchTerms([]);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    // toggle para conectar con lector anónimo (si participa o no)
    const [participate, setParticipate] = useState(false);
    const [participateLoading, setParticipateLoading] = useState(false);
    const [matchLoading, setMatchLoading] = useState(false);
    const [matchError, setMatchError] = useState("");
    const [matchData, setMatchData] = useState(null);

    const loadConnectStatus = async () => {
        try {
            setParticipateLoading(true);
            // si no hay user (logout), reseteamos y salimos
            if (!auth.currentUser) {
                setParticipate(false);
                setMatchData(null);
                setMatchError("");
                return;
            }
            const token = await auth.currentUser.getIdToken();
            const data = await api.getConnectReaderStatus(token);
            // backend --> optIn: true/false
            setParticipate(!!data?.optIn);
        } catch (e) {
            console.error(e);
            // si falla dejamos toggle en false
            setParticipate(false);
        } finally {
            setParticipateLoading(false);
        }
    };

    const toggleParticipate = async () => {
        const next = !participate;
        try {
            setParticipateLoading(true);
            setMatchError("");
            const token = await auth.currentUser.getIdToken();
            await api.setConnectReaderOptIn(token, { optIn: next });
            setParticipate(next);
            if (!next) setMatchData(null);
        } catch (e) {
            alert(e.message || "Error actualizando participate");
        } finally {
            setParticipateLoading(false);
        }
    };

    const runMatch = async () => {
        try {
            setMatchLoading(true);
            setMatchError("");
            const token = await auth.currentUser.getIdToken();
            const data = await api.connectReaderMatch(token);
            // match o match null con reason
            setMatchData(data || null);
        } catch (e) {
            setMatchError(e.message || "Error buscando match");
            setMatchData(null);
        } finally {
            setMatchLoading(false);
        }
    };

    useEffect(() => {
        if (tab === "connect") {
            loadConnectStatus();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    // recargar el estado de participate cuando cambie la sesión (login/logout/cambio de cuenta)
    useEffect(() => {
        const unsub = auth.onAuthStateChanged(() => {
            if (tab === "connect") {
                loadConnectStatus();
            } else {
                // si no estamos en connect, solo reseteamos UI local
                setParticipate(false);
                setMatchData(null);
                setMatchError("");
            }
        });
        return () => unsub();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab]);

    const toggleStyle = (on) => ({
        width: 44,
        height: 26,
        borderRadius: 999,
        border: `1px solid ${on ? ACCENT : BORDER}`,
        background: on ? ACCENT : "#F6F3EF",
        position: "relative",
        cursor: "pointer",
        opacity: participateLoading ? 0.6 : 1,
        pointerEvents: participateLoading ? "none" : "auto",
    });

    const knobStyle = (on) => ({
        width: 20,
        height: 20,
        borderRadius: 999,
        background: "white",
        position: "absolute",
        top: 2,
        left: on ? 22 : 2,
        transition: "left 160ms ease",
        border: `1px solid ${BORDER}`,
    });

    // card para luego reusar: cover, título, subtítulo y opcional rightslot (emojis para feedback)
    const CardRow = ({ coverUrl, titleText, subtitleText, rightSlot }) => (
        <div
            style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: 12,
                display: "flex",
                gap: 12,
                alignItems: "center",
                background: "white",
            }}
        >
            <div
                style={{
                    width: 54,
                    height: 78,
                    borderRadius: 10,
                    border: `1px solid ${BORDER}`,
                    background: "#F6F3EF",
                    overflow: "hidden",
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: MUTED,
                    fontSize: 12,
                    fontWeight: 900,
                }}
            >
                {coverUrl ? (
                    <img src={coverUrl} alt={titleText} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    "Cover"
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 900, color: ACCENT, fontSize: 14 }}>{titleText}</div>
                <div style={{ marginTop: 4, color: MUTED, fontSize: 13 }}>{subtitleText}</div>
            </div>

            {rightSlot ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{rightSlot}</div> : null}
        </div>
    );

    // normalizamos para que funcione tanto si viene {match:{...}} como si viene directo
    const normalizedMatch = useMemo(() => {
        if (!matchData) return null;
        if (matchData.match) return matchData.match;
        return matchData;
    }, [matchData]);

    return (
        <div style={sectionWrap}>
            <div style={title}>Discover</div>
            <div style={sub}>Recomendaciones, mood y conexión con lectores.</div>

            {/* tabs (for you, mood, connect) */}
            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {tabs.map((t) => (
                    <button key={t.key} type="button" style={pill(tab === t.key)} onClick={() => setTab(t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div style={divider} />

            {/* for you */}
            {tab === "for_you" && (
                <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ fontWeight: 900, color: ACCENT }}>Recommendations</div>

                    {/* book of the day */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <div style={{ fontWeight: 900, color: ACCENT }}>Book of the day</div>
                            <div style={{ color: MUTED, fontSize: 12 }}>Daily</div>
                        </div>

                        <div style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>
                            {bookOfDayLoading ? "Cargando..." : (bookOfDayData.subtitle || "")}
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <CardRow
                                coverUrl={bookOfDayData.book.coverUrl}
                                titleText={bookOfDayData.book.title}
                                subtitleText={bookOfDayData.book.author}
                                rightSlot={
                                    <>
                                        {/* like/dislike */}
                                        <button
                                            type="button"
                                            style={pill(bookOfDayFeedback === 1)}
                                            title="Buena recomendación"
                                            disabled={bookOfDayFeedbackLoading || bookOfDayLoading}
                                            onClick={() => sendFeedback(1)}
                                        >
                                            👍
                                        </button>
                                        <button
                                            type="button"
                                            style={pill(bookOfDayFeedback === -1)}
                                            title="Mala recomendación"
                                            disabled={bookOfDayFeedbackLoading || bookOfDayLoading}
                                            onClick={() => sendFeedback(-1)}
                                        >
                                            👎
                                        </button>
                                    </>
                                }
                            />
                        </div>
                    </div>
                    {/* book of the day AI */}
                    <div>
                        <div style={{ fontWeight: 900, color: ACCENT }}>Book of the day (AI)</div>
                        <div style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>
                            {bookOfDayAILoading ? "Cargando..." : (bookOfDayAIData.subtitle || "")}
                        </div>

                        {!bookOfDayAILoading && bookOfDayAI ? (
                            <div style={{ marginTop: 10 }}>
                                <CardRow
                                    coverUrl={bookOfDayAIData.book.coverUrl}
                                    titleText={bookOfDayAIData.book.title}
                                    subtitleText={bookOfDayAIData.book.author}
                                />
                            </div>
                        ) : null}
                    </div>

                </div>
            )}

            {/* recommendation por mood */}
            {tab === "mood" && (
                <div style={{ display: "grid", gap: 12 }}>
                    {/* header + expand */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <div>
                            <div style={{ fontWeight: 900, color: ACCENT }}>Mood</div>
                            <div style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>How do you feel today?</div>
                        </div>

                        <button
                            type="button"
                            style={pill(false)}
                            onClick={() => setMoodExpanded((v) => !v)}
                            title={moodExpanded ? "Contraer" : "Expandir"}
                        >
                            {moodExpanded ? "▾" : "▸"}
                        </button>
                    </div>

                    {moodExpanded && (
                        <>
                            {/* chips */}
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                {moods.map((m) => (
                                    <button
                                        key={m.key}
                                        type="button"
                                        style={pill(selectedMood === m.key)}
                                        onClick={() => {
                                            const next = selectedMood === m.key ? "" : m.key;
                                            setSelectedMood(next);
                                            fetchMoodRecs({ mood: next, moodText: "" });
                                        }}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {/* optional mood text */}
                            <input
                                value={moodText}
                                onChange={(e) => setMoodText(e.target.value)}
                                placeholder='Describe cómo te sientes (opcional), ej: "me siento saturado"'
                                style={inputStyle}
                            />

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    style={ghostBtn}
                                    onClick={() => fetchMoodRecs({ mood: "", moodText })}
                                    disabled={loading}
                                >
                                    {loading ? "Cargando..." : "Get recommendations"}
                                </button>

                                <button
                                    type="button"
                                    style={ghostBtn}
                                    onClick={() => {
                                        setSelectedMood("");
                                        setMoodText("");
                                        setServerMood("");
                                        setBlurb("");
                                        setSearchTerms([]);
                                        setItems([]);
                                        setError("");
                                    }}
                                >
                                    Clear
                                </button>
                            </div>

                            {/* status */}
                            <div style={{ color: MUTED, fontSize: 13 }}>
                                {error
                                    ? `⚠️ ${error}`
                                    : serverMood
                                        ? `Mood: ${serverMood}${blurb ? ` · ${blurb}` : ""}`
                                        : ""}
                            </div>

                            {searchTerms.length > 0 && !error && (
                                <div style={{ color: MUTED, fontSize: 12 }}>Búsqueda usada: {searchTerms.join(" · ")}</div>
                            )}

                            {/* results */}
                            <div style={{ display: "grid", gap: 10 }}>
                                {items.map((b) => {
                                    const cover = b.coverId ? `https://covers.openlibrary.org/b/id/${b.coverId}-M.jpg` : "";
                                    return (
                                        <CardRow
                                            key={(b.key || "") + (b.title || "")}
                                            coverUrl={cover}
                                            titleText={b.title}
                                            subtitleText={`${b.author || "Autor desconocido"}${b.firstPublishYear ? ` · ${b.firstPublishYear}` : ""}`}
                                            rightSlot={
                                                <>
                                                    {/* feedback */}
                                                    <button type="button" style={pill(false)} title="Buena recomendación">
                                                        👍
                                                    </button>
                                                    <button type="button" style={pill(false)} title="Mala recomendación">
                                                        👎
                                                    </button>
                                                </>
                                            }
                                        />
                                    );
                                })}

                                {!loading && items.length === 0 && !error && (
                                    <div style={{ color: MUTED, fontSize: 13 }}>
                                        Elige un mood o escribe cómo te sientes para ver recomendaciones.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* connect with a reader */}
            {tab === "connect" && (
                <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontWeight: 900, color: ACCENT }}>Connect with a reader</div>
                            <div style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>
                                Participa para que el sistema encuentre lectores afines.
                            </div>
                        </div>

                        <div
                            role="button"
                            tabIndex={0}
                            style={toggleStyle(participate)}
                            onClick={() => toggleParticipate()}
                            onKeyDown={(e) => (e.key === "Enter" ? toggleParticipate() : null)}
                            aria-label="Participate"
                            title="Participate"
                        >
                            <div style={knobStyle(participate)} />
                        </div>
                    </div>

                    {!participate ? (
                        <div style={{ color: MUTED, fontSize: 13 }}>
                            Activa <b>Participate</b> para ver el matching.
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                            <div
                                style={{
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 16,
                                    padding: 12,
                                    background: "white",
                                }}
                            >
                                <div style={{ fontWeight: 900, color: ACCENT }}>Find your twin reader</div>
                                <div style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>
                                    luego mostraremos: match %, shared genres, shared mood y recomendaciones cruzadas
                                </div>

                                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    <button
                                        type="button"
                                        style={ghostBtn}
                                        onClick={runMatch}
                                        disabled={matchLoading || participateLoading}
                                    >
                                        {matchLoading ? "Buscando..." : "Search reader"}
                                    </button>
                                    <button
                                        type="button"
                                        style={ghostBtn}
                                        onClick={() => {
                                            setMatchData(null);
                                            setMatchError("");
                                            runMatch();
                                        }}
                                        disabled={matchLoading || participateLoading}
                                    >
                                        Search new reader
                                    </button>
                                </div>

                                {matchError ? (
                                    <div style={{ marginTop: 10, color: MUTED, fontSize: 13 }}>
                                        {`⚠️ ${matchError}`}
                                    </div>
                                ) : null}

                                {/* si backend devuelve reason */}
                                {matchData && matchData.reason && !normalizedMatch ? (
                                    <div style={{ marginTop: 10, color: MUTED, fontSize: 13 }}>
                                        {matchData.reason === "no_candidates"
                                            ? "No hay candidatos todavía (prueba con otra cuenta activando Participate)."
                                            : "No se ha encontrado match todavía."}
                                    </div>
                                ) : null}
                            </div>

                            {normalizedMatch ? (
                                <div
                                    style={{
                                        border: `1px solid ${BORDER}`,
                                        borderRadius: 16,
                                        padding: 12,
                                        background: "white",
                                    }}
                                >
                                    <div style={{ fontWeight: 900, color: ACCENT }}>Match found</div>
                                    <div style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>
                                        Match: {typeof normalizedMatch.percent === "number" ? `${normalizedMatch.percent}%` : "—"}
                                        {Array.isArray(normalizedMatch.sharedGenres) && normalizedMatch.sharedGenres.length
                                            ? ` · Shared genres: ${normalizedMatch.sharedGenres.slice(0, 3).join(", ")}`
                                            : ""}
                                        {normalizedMatch.sharedMood
                                            ? ` · Shared mood: ${normalizedMatch.sharedMood}`
                                            : ""}
                                    </div>

                                    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                                        {(Array.isArray(normalizedMatch.recommendations) ? normalizedMatch.recommendations : [])
                                            .slice(0, 5)
                                            .map((r, idx) => {
                                                const cover = r.coverId
                                                    ? `https://covers.openlibrary.org/b/id/${r.coverId}-M.jpg`
                                                    : (r.coverUrl || "");
                                                const subtitleText = `${r.author || "Autor/a"}${r.reason ? ` · ${r.reason}` : ""}`;
                                                return (
                                                    <CardRow
                                                        key={(r.workKey || r.key || "") + idx}
                                                        coverUrl={cover}
                                                        titleText={r.title || `Recommendation ${idx + 1}`}
                                                        subtitleText={subtitleText}
                                                    />
                                                );
                                            })}

                                        {(!normalizedMatch.recommendations || normalizedMatch.recommendations.length === 0) ? (
                                            <div style={{ color: MUTED, fontSize: 13 }}>
                                                No hay recomendaciones todavía (prueba Search new reader).
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}