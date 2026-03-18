import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../firebase";
import { api } from "../services/api";

export default function Discover({
                                     BORDER,
                                     CARD,
                                     ACCENT,
                                     MUTED,
                                     ghostBtn,
                                     bookOfDay,
                                     bookOfDayLoading,
                                     books,
                                     customShelves,
                                     addFromResult,
                                     toggleBookShelf,
                                     addStatusByKey,
                                     setAddStatusByKey,
                                     setSelectedBook,
                                 }) {
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

    const softCard = {
        border: `1px solid ${BORDER}`,
        borderRadius: 24,
        background: "#FCFBF8",
        padding: 16,
    };

    // top tabs
    const [tab, setTab] = useState("for_you"); // for_you, mood, connect, reviews

    const tabs = useMemo(
        () => [
            { key: "for_you", label: "For you" },
            { key: "reviews", label: "Reviews" },
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
            "Placeholder: Book title";

        const authorText =
            bookOfDay?.book?.author ||
            bookOfDay?.author ||
            "Author";

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
    const [bookOfDayAIFeedback, setBookOfDayAIFeedback] = useState(0); // 1 like, -1 dislike, 0 none
    const [bookOfDayAIFeedbackLoading, setBookOfDayAIFeedbackLoading] = useState(false);
    const [aiRevealed, setAiRevealed] = useState(false);
    const [aiAnimating, setAiAnimating] = useState(false);

    const bookOfDayAIData = useMemo(() => {
        const titleText = bookOfDayAI?.title || "Placeholder: AI book";
        const authorText = bookOfDayAI?.author || "Author";
        const coverUrl = bookOfDayAI?.coverUrl || "";
        const subtitleText = bookOfDayAI?.reason || "";

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

    const bookOfDayDoc = useMemo(() => {
        if (!bookOfDayData?.book?.title) return null;

        const workKey =
            bookOfDay?.openLibrary?.workKey ||
            bookOfDay?.book?.openLibrary?.workKey ||
            "";

        const coverId =
            bookOfDay?.openLibrary?.coverId ??
            bookOfDay?.book?.openLibrary?.coverId ??
            null;

        return {
            key: workKey || `bod-${bookOfDayData.book.title}-${bookOfDayData.book.author}`,
            title: bookOfDayData.book.title,
            author_name: [bookOfDayData.book.author || ""],
            cover_i: coverId,
        };
    }, [bookOfDay, bookOfDayData]);

    const bookOfDayAIDoc = useMemo(() => {
        if (!bookOfDayAIData?.book?.title) return null;

        const workKey = bookOfDayAI?.openLibrary?.workKey || "";
        const coverId = bookOfDayAI?.openLibrary?.coverId ?? null;

        return {
            key: workKey || `bod-ai-${bookOfDayAIData.book.title}-${bookOfDayAIData.book.author}`,
            title: bookOfDayAIData.book.title,
            author_name: [bookOfDayAIData.book.author || ""],
            cover_i: coverId,
        };
    }, [bookOfDayAI, bookOfDayAIData]);

    const existingBookOfDay = useMemo(() => {
        if (!bookOfDayDoc) return null;

        const byCover = bookOfDayDoc.cover_i
            ? books.find((b) => b?.cover?.openLibraryCoverId === bookOfDayDoc.cover_i)
            : null;

        const titleNormalized = (bookOfDayDoc.title || "").trim().toLowerCase();
        const authorNormalized = ((bookOfDayDoc.author_name && bookOfDayDoc.author_name[0]) || "")
            .trim()
            .toLowerCase();

        const byText = books.find((b) => {
            const bt = (b.title || "").trim().toLowerCase();
            const ba = (b.author || "").trim().toLowerCase();
            return bt === titleNormalized && ba === authorNormalized;
        });

        return byCover || byText || null;
    }, [bookOfDayDoc, books]);

    const existingBookOfDayAI = useMemo(() => {
        if (!bookOfDayAIDoc) return null;

        const byCover = bookOfDayAIDoc.cover_i
            ? books.find((b) => b?.cover?.openLibraryCoverId === bookOfDayAIDoc.cover_i)
            : null;

        const titleNormalized = (bookOfDayAIDoc.title || "").trim().toLowerCase();
        const authorNormalized = ((bookOfDayAIDoc.author_name && bookOfDayAIDoc.author_name[0]) || "")
            .trim()
            .toLowerCase();

        const byText = books.find((b) => {
            const bt = (b.title || "").trim().toLowerCase();
            const ba = (b.author || "").trim().toLowerCase();
            return bt === titleNormalized && ba === authorNormalized;
        });

        return byCover || byText || null;
    }, [bookOfDayAIDoc, books]);

    // clave por día para recordar si el libro ya fue revelado
    const revealStorageKey = useMemo(() => {
        const day =
            bookOfDay?.day ||
            bookOfDayAI?.day ||
            new Date().toISOString().slice(0, 10);

        return `discover_ai_revealed_${day}`;
    }, [bookOfDay?.day, bookOfDayAI?.day]);

    // reviews feed
    const [reviewsFeed, setReviewsFeed] = useState([]);
    const [reviewsFeedLoading, setReviewsFeedLoading] = useState(false);
    const [reviewsFeedError, setReviewsFeedError] = useState("");
    const [reviewsQuery, setReviewsQuery] = useState("");

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

    // cargamos feedback book of the day AI
    const loadAIFeedback = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const data = await api.getBookOfDayAIFeedback(token);
            setBookOfDayAIFeedback(data?.value || 0);
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
            return data || null;
        } catch (e) {
            console.error(e);
            setBookOfDayAI(null);
            return null;
        } finally {
            setBookOfDayAILoading(false);
        }
    };

    // cargamos feed de reseñas públicas
    const loadReviewsFeed = async (q = "") => {
        try {
            setReviewsFeedLoading(true);
            setReviewsFeedError("");

            const token = await auth.currentUser.getIdToken();
            const data = await api.getReviewsFeed(token, { q, limit: 20 });

            setReviewsFeed(Array.isArray(data) ? data : []);
        } catch (e) {
            setReviewsFeed([]);
            setReviewsFeedError(e.message || "Error loading reviews");
        } finally {
            setReviewsFeedLoading(false);
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
            alert(e.message || "Error saving feedback");
        } finally {
            setBookOfDayFeedbackLoading(false);
        }
    };

    // enviamos feedback AI: activamos loading, haciendo post al backend (1 o -1) y actualizamos estado
    const sendAIFeedback = async (value) => {
        try {
            setBookOfDayAIFeedbackLoading(true);
            const token = await auth.currentUser.getIdToken();
            await api.sendBookOfDayAIFeedback(token, value);
            setBookOfDayAIFeedback(value);
        } catch (e) {
            alert(e.message || "Error saving AI feedback");
        } finally {
            setBookOfDayAIFeedbackLoading(false);
        }
    };

    // cuando cambie bookOfDay o Loading, revisamos si ya tiene un libro y que ya no esté cargando
    useEffect(() => {
        if (bookOfDay && !bookOfDayLoading) {
            loadFeedback();
        }
    }, [bookOfDay, bookOfDayLoading]);

    useEffect(() => {
        if (bookOfDayAI) {
            loadAIFeedback();
        }
    }, [bookOfDayAI]);

    useEffect(() => {
        setAiAnimating(false);
        setBookOfDayAIFeedback(0);

        const alreadyRevealed = localStorage.getItem(revealStorageKey) === "true";
        setAiRevealed(alreadyRevealed);
    }, [bookOfDay?.day, bookOfDay?.title, revealStorageKey]);

    useEffect(() => {
        if (tab !== "for_you") return;
        loadBookOfDayAI();
    }, [tab]);

    useEffect(() => {
        if (tab !== "reviews") return;
        loadReviewsFeed(reviewsQuery);
    }, [tab]);

    // guardamos si el usuario ya reveló el libro de hoy
    useEffect(() => {
        if (aiRevealed) {
            localStorage.setItem(revealStorageKey, "true");
        }
    }, [aiRevealed, revealStorageKey]);

    const revealAIBook = async () => {
        if (aiRevealed || aiAnimating || bookOfDayAILoading) return;

        try {
            setAiAnimating(true);

            let data = bookOfDayAI;
            if (!data) {
                data = await loadBookOfDayAI();
            }

            setTimeout(() => {
                setAiRevealed(true);
                setAiAnimating(false);
            }, 320);
        } catch (e) {
            console.error(e);
            setAiAnimating(false);
        }
    };

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
            setError(e.message || "Error loading recommendations");
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
            alert(e.message || "Error updating participate");
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
            setMatchError(e.message || "Error searching match");
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

    const HeroRevealCard = ({
                                onReveal,
                                loading,
                                revealed,
                                animating,
                                revealedCoverUrl,
                                titleText,
                                authorText,
                                subtitleText,
                            }) => (
        <div
            style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 28,
                padding: 18,
                background: "linear-gradient(180deg, #FFFEFC 0%, #F8F4EE 100%)",
                boxShadow: "0 12px 30px rgba(47,42,36,0.05)",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 14,
                }}
            >
                <div>
                    <div
                        style={{
                            color: MUTED,
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                        }}
                    >
                        Today&apos;s pick
                    </div>
                    <div
                        style={{
                            marginTop: 6,
                            color: ACCENT,
                            fontWeight: 900,
                            fontSize: 24,
                            lineHeight: 1.05,
                            letterSpacing: "-0.03em",
                        }}
                    >
                        A book for today
                    </div>
                </div>

                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 999,
                        padding: "7px 10px",
                        background: "rgba(255,255,255,0.85)",
                        color: ACCENT,
                        fontSize: 12,
                        fontWeight: 900,
                        whiteSpace: "nowrap",
                    }}
                >
                    AI pick
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: revealed ? "120px 1fr" : "1fr",
                    gap: 18,
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <motion.button
                        type="button"
                        onClick={onReveal}
                        disabled={loading || revealed || animating}
                        whileHover={!loading && !revealed && !animating ? { y: -3, rotate: -1 } : {}}
                        whileTap={!loading && !revealed && !animating ? { scale: 0.985 } : {}}
                        animate={animating ? { rotateY: -20, scale: 1.03 } : { rotateY: 0, scale: 1 }}
                        transition={{ duration: 0.35 }}
                        style={{
                            width: revealed ? 120 : 156,
                            height: revealed ? 180 : 228,
                            borderRadius: 16,
                            overflow: "hidden",
                            border: `1px solid ${BORDER}`,
                            background: "#F6F3EF",
                            padding: 0,
                            cursor: loading || revealed || animating ? "default" : "pointer",
                            position: "relative",
                            boxShadow: "0 14px 28px rgba(47,42,36,0.10)",
                        }}
                        title="Reveal book"
                    >
                        <AnimatePresence mode="wait">
                            {!revealed && !animating ? (
                                <motion.img
                                    key="mystery"
                                    src="/mystery-book.png"
                                    alt="Mystery book"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                            ) : revealedCoverUrl ? (
                                <motion.img
                                    key="revealed"
                                    src={revealedCoverUrl}
                                    alt="Revealed book"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        display: "block",
                                    }}
                                />
                            ) : (
                                <motion.div
                                    key="revealed-placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: MUTED,
                                        fontWeight: 900,
                                        fontSize: 12,
                                        background: "#F6F3EF",
                                    }}
                                >
                                    Cover
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>

                <div style={{ minWidth: 0 }}>
                    {!revealed ? (
                        <>
                            <div
                                style={{
                                    color: ACCENT,
                                    fontWeight: 900,
                                    fontSize: 18,
                                    lineHeight: 1.2,
                                }}
                            >
                                Tap to reveal
                            </div>
                            <div
                                style={{
                                    marginTop: 8,
                                    color: MUTED,
                                    fontSize: 14,
                                    lineHeight: 1.55,
                                    maxWidth: 340,
                                }}
                            >
                                A story to keep you company today.
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                style={{
                                    color: ACCENT,
                                    fontWeight: 900,
                                    fontSize: 24,
                                    lineHeight: 1.08,
                                    letterSpacing: "-0.03em",
                                }}
                            >
                                {titleText}
                            </div>

                            <div
                                style={{
                                    marginTop: 8,
                                    color: MUTED,
                                    fontSize: 15,
                                    lineHeight: 1.4,
                                }}
                            >
                                {authorText}
                            </div>

                            {!!subtitleText && (
                                <div
                                    style={{
                                        marginTop: 14,
                                        border: `1px solid ${BORDER}`,
                                        borderRadius: 18,
                                        background: "rgba(255,255,255,0.7)",
                                        padding: 12,
                                        color: ACCENT,
                                        fontSize: 13,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {subtitleText}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    const FeedbackBar = ({ value, loading, onLike, onDislike }) => (
        <div
            style={{
                ...softCard,
                padding: 14,
            }}
        >
            <div
                style={{
                    fontSize: 12,
                    color: MUTED,
                    fontWeight: 800,
                    marginBottom: 10,
                    letterSpacing: "0.01em",
                }}
            >
                How does this recommendation feel?
            </div>

            <div style={{ display: "flex", gap: 10 }}>
                <button
                    type="button"
                    onClick={onLike}
                    disabled={loading}
                    style={{
                        flex: 1,
                        borderRadius: 18,
                        border: `1px solid ${value === 1 ? ACCENT : BORDER}`,
                        background: value === 1 ? ACCENT : "white",
                        color: value === 1 ? "white" : ACCENT,
                        padding: "14px 12px",
                        fontWeight: 900,
                        cursor: loading ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontSize: 14,
                    }}
                    title="Good AI recommendation"
                >
                    <span style={{ fontSize: 18 }}>👍</span>
                    This fits me
                </button>

                <button
                    type="button"
                    onClick={onDislike}
                    disabled={loading}
                    style={{
                        flex: 1,
                        borderRadius: 18,
                        border: `1px solid ${value === -1 ? ACCENT : BORDER}`,
                        background: value === -1 ? ACCENT : "white",
                        color: value === -1 ? "white" : ACCENT,
                        padding: "14px 12px",
                        fontWeight: 900,
                        cursor: loading ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        fontSize: 14,
                    }}
                    title="Bad AI recommendation"
                >
                    <span style={{ fontSize: 18 }}>👎</span>
                    Not for now
                </button>
            </div>
        </div>
    );

    const StatusPicker = ({ doc, existingBook }) => {
        if (!doc) return null;

        const options = [
            { key: "to_read", label: "Want to read" },
            { key: "reading", label: "Currently reading" },
            { key: "paused", label: "Interrupted" },
            { key: "finished", label: "Finished" },
        ];

        return (
            <div style={softCard}>
                <div
                    style={{
                        fontSize: 12,
                        color: MUTED,
                        fontWeight: 800,
                        marginBottom: 10,
                        letterSpacing: "0.01em",
                    }}
                >
                    {existingBook ? "Update status" : "Save to status"}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {options.map((opt) => {
                        const active = !!existingBook && existingBook.status === opt.key;

                        return (
                            <button
                                key={opt.key}
                                type="button"
                                onClick={() => {
                                    if (existingBook?.id) {
                                        const nextStatus = existingBook.status === opt.key ? "" : opt.key;
                                        addFromResult(doc, { status: nextStatus });
                                        return;
                                    }

                                    addFromResult(doc, {
                                        status: opt.key,
                                    });
                                }}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 999,
                                    border: `1px solid ${active ? ACCENT : BORDER}`,
                                    background: active ? ACCENT : CARD,
                                    color: active ? "white" : ACCENT,
                                    fontWeight: active ? 900 : 700,
                                    cursor: "pointer",
                                    fontSize: 12,
                                }}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const ShelfPicker = ({ doc, existingBook }) => {
        if (!doc || !customShelves?.length) return null;

        return (
            <div style={softCard}>
                <div
                    style={{
                        fontSize: 12,
                        color: MUTED,
                        fontWeight: 800,
                        marginBottom: 10,
                        letterSpacing: "0.01em",
                    }}
                >
                    Add to shelves
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {customShelves.map((s) => {
                        const shelfName = typeof s === "string" ? s : s?.name || "";
                        const shelfKey = typeof s === "string" ? s : s?.id || shelfName;

                        if (!shelfName) return null;

                        const active =
                            !!existingBook &&
                            Array.isArray(existingBook.shelves) &&
                            existingBook.shelves.includes(shelfName);

                        return (
                            <button
                                key={shelfKey}
                                type="button"
                                onClick={() => {
                                    if (existingBook?.id) {
                                        toggleBookShelf(existingBook.id, shelfName);
                                        return;
                                    }

                                    addFromResult(doc, {
                                        shelves: [shelfName],
                                    });
                                }}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 999,
                                    border: `1px solid ${active ? ACCENT : BORDER}`,
                                    background: active ? "#F6F3EF" : CARD,
                                    fontWeight: active ? 900 : 700,
                                    cursor: "pointer",
                                    color: ACCENT,
                                    fontSize: 12,
                                }}
                                title={active ? "Remove from this shelf" : "Add to this shelf"}
                            >
                                {shelfName}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const ReviewFeedCard = ({ review }) => (
        <button
            type="button"
            onClick={() => {
                const existing = books.find((b) => {
                    const sameTitle = (b.title || "").trim().toLowerCase() === (review.title || "").trim().toLowerCase();
                    const sameAuthor = (b.author || "").trim().toLowerCase() === (review.author || "").trim().toLowerCase();
                    return sameTitle && sameAuthor;
                });

                if (existing) {
                    setSelectedBook(existing);
                    return;
                }

                setSelectedBook({
                    id: `discover-review-${review.id}`,
                    title: review.title || "Book",
                    author: review.author || "",
                    cover: {
                        url: review.coverUrl || "",
                        source: "openlibrary",
                        openLibraryCoverId: null,
                    },
                    status: "",
                    shelves: [],
                    openLibrary: {
                        workKey: review.openLibrary?.workKey || "",
                        authorKey: review.openLibrary?.authorKey || "",
                    },
                    readCount: 0,
                    _discoverPreview: true,
                });
            }}
            style={{
                textAlign: "left",
                border: `1px solid ${BORDER}`,
                borderRadius: 22,
                background: "white",
                padding: 14,
                cursor: "pointer",
                display: "grid",
                gap: 12,
            }}
        >
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
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
                    {review.coverUrl ? (
                        <img
                            src={review.coverUrl}
                            alt={review.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        "Cover"
                    )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontWeight: 900,
                            color: ACCENT,
                            fontSize: 16,
                            lineHeight: 1.2,
                        }}
                    >
                        {review.title}
                    </div>

                    {review.author ? (
                        <div style={{ marginTop: 4, color: MUTED, fontSize: 13 }}>
                            {review.author}
                        </div>
                    ) : null}

                    <div
                        style={{
                            marginTop: 8,
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                            alignItems: "center",
                        }}
                    >
                        <div
                            style={{
                                border: `1px solid ${BORDER}`,
                                borderRadius: 999,
                                padding: "6px 8px",
                                background: "#F6F3EF",
                                color: ACCENT,
                                fontSize: 12,
                                fontWeight: 900,
                            }}
                        >
                            {review.rating ? `⭐ ${review.rating}/5` : "No rating"}
                        </div>

                        <div style={{ color: MUTED, fontSize: 12, fontWeight: 800 }}>
                            {review.authorLabel || "Anonymous reader"}
                        </div>
                    </div>
                </div>
            </div>

            <div
                style={{
                    color: ACCENT,
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                }}
            >
                {review.text}
            </div>

            <div style={{ color: MUTED, fontSize: 12 }}>
                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
            </div>
        </button>
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
            <div style={sub}>Recommendations, mood, and reader connection.</div>

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
                <div style={{ display: "grid", gap: 14 }}>
                    <div
                        style={{
                            display: "grid",
                            gap: 6,
                        }}
                    >
                        <div
                            style={{
                                color: MUTED,
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                            }}
                        >
                            Discover
                        </div>

                        <div
                            style={{
                                color: ACCENT,
                                fontWeight: 900,
                                fontSize: 28,
                                lineHeight: 1.02,
                                letterSpacing: "-0.04em",
                            }}
                        >
                            A book for today
                        </div>

                        <div
                            style={{
                                color: MUTED,
                                fontSize: 14,
                                lineHeight: 1.5,
                                maxWidth: 420,
                            }}
                        >
                            One recommendation, chosen for today.
                        </div>
                    </div>

                    {/* book of the day */}
                    {/*
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <div style={{ fontWeight: 900, color: ACCENT }}>Book of the day</div>
                            <div style={{ color: MUTED, fontSize: 12 }}>Daily</div>
                        </div>

                        <div style={{ marginTop: 6, color: MUTED, fontSize: 13 }}>
                            {bookOfDayLoading ? "Loading..." : (bookOfDayData.subtitle || "")}
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <CardRow
                                coverUrl={bookOfDayData.book.coverUrl}
                                titleText={bookOfDayData.book.title}
                                subtitleText={bookOfDayData.book.author}
                                rightSlot={
                                    <>
                                        <button
                                            type="button"
                                            style={pill(bookOfDayFeedback === 1)}
                                            title="Good recommendation"
                                            disabled={bookOfDayFeedbackLoading || bookOfDayLoading}
                                            onClick={() => sendFeedback(1)}
                                        >
                                            👍
                                        </button>
                                        <button
                                            type="button"
                                            style={pill(bookOfDayFeedback === -1)}
                                            title="Bad recommendation"
                                            disabled={bookOfDayFeedbackLoading || bookOfDayLoading}
                                            onClick={() => sendFeedback(-1)}
                                        >
                                            👎
                                        </button>
                                    </>
                                }
                            />
                            <StatusPicker
                                doc={bookOfDayDoc}
                                existingBook={existingBookOfDay}
                            />
                            <ShelfPicker
                                doc={bookOfDayDoc}
                                existingBook={existingBookOfDay}
                            />
                        </div>
                    </div>
                    */}

                    {/* book of the day AI */}
                    <HeroRevealCard
                        onReveal={revealAIBook}
                        loading={bookOfDayAILoading}
                        revealed={aiRevealed}
                        animating={aiAnimating}
                        revealedCoverUrl={bookOfDayAIData.book.coverUrl}
                        titleText={bookOfDayAIData.book.title}
                        authorText={bookOfDayAIData.book.author}
                        subtitleText={aiRevealed ? bookOfDayAIData.subtitle : ""}
                    />

                    {aiRevealed && !bookOfDayAILoading && bookOfDayAI ? (
                        <>
                            <FeedbackBar
                                value={bookOfDayAIFeedback}
                                loading={bookOfDayAIFeedbackLoading || bookOfDayAILoading}
                                onLike={() => sendAIFeedback(1)}
                                onDislike={() => sendAIFeedback(-1)}
                            />

                            <StatusPicker
                                doc={bookOfDayAIDoc}
                                existingBook={existingBookOfDayAI}
                            />

                            <ShelfPicker
                                doc={bookOfDayAIDoc}
                                existingBook={existingBookOfDayAI}
                            />
                        </>
                    ) : null}
                </div>
            )}

            {/* reviews feed */}
            {tab === "reviews" && (
                <div style={{ display: "grid", gap: 14 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                        <div
                            style={{
                                color: MUTED,
                                fontSize: 12,
                                fontWeight: 800,
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                            }}
                        >
                            Public reviews
                        </div>

                        <div
                            style={{
                                color: ACCENT,
                                fontWeight: 900,
                                fontSize: 26,
                                lineHeight: 1.04,
                                letterSpacing: "-0.03em",
                            }}
                        >
                            Read what others thought
                        </div>

                        <div
                            style={{
                                color: MUTED,
                                fontSize: 14,
                                lineHeight: 1.5,
                                maxWidth: 460,
                            }}
                        >
                            Anonymous reviews to help you decide if a book feels right for you.
                        </div>
                    </div>

                    <div style={softCard}>
                        <div style={{ display: "grid", gap: 10 }}>
                            <input
                                value={reviewsQuery}
                                onChange={(e) => setReviewsQuery(e.target.value)}
                                placeholder="Search a word in reviews"
                                style={inputStyle}
                            />

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    style={ghostBtn}
                                    onClick={() => loadReviewsFeed(reviewsQuery)}
                                    disabled={reviewsFeedLoading}
                                >
                                    {reviewsFeedLoading ? "Loading..." : "Search reviews"}
                                </button>

                                <button
                                    type="button"
                                    style={ghostBtn}
                                    onClick={() => {
                                        setReviewsQuery("");
                                        loadReviewsFeed("");
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {reviewsFeedError ? (
                        <div style={{ color: MUTED, fontSize: 13 }}>
                            {`⚠️ ${reviewsFeedError}`}
                        </div>
                    ) : null}

                    <div style={{ display: "grid", gap: 12 }}>
                        {reviewsFeedLoading ? (
                            <div style={{ color: MUTED, fontSize: 13 }}>
                                Loading reviews...
                            </div>
                        ) : reviewsFeed.length === 0 ? (
                            <div style={{ color: MUTED, fontSize: 13 }}>
                                There are no public reviews to show yet.
                            </div>
                        ) : (
                            reviewsFeed.map((review) => (
                                <ReviewFeedCard key={review.id} review={review} />
                            ))
                        )}
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
                            title={moodExpanded ? "Collapse" : "Expand"}
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
                                placeholder='Describe how you feel (optional), e.g. "I feel overwhelmed"'
                                style={inputStyle}
                            />

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    style={ghostBtn}
                                    onClick={() => fetchMoodRecs({ mood: "", moodText })}
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Get recommendations"}
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
                                <div style={{ color: MUTED, fontSize: 12 }}>
                                    Search used: {searchTerms.join(" · ")}
                                </div>
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
                                            subtitleText={`${b.author || "Unknown author"}${b.firstPublishYear ? ` · ${b.firstPublishYear}` : ""}`}
                                            rightSlot={
                                                <>
                                                    <button type="button" style={pill(false)} title="Good recommendation">
                                                        👍
                                                    </button>
                                                    <button type="button" style={pill(false)} title="Bad recommendation">
                                                        👎
                                                    </button>
                                                </>
                                            }
                                        />
                                    );
                                })}

                                {!loading && items.length === 0 && !error && (
                                    <div style={{ color: MUTED, fontSize: 13 }}>
                                        Choose a mood or write how you feel to see recommendations.
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
                                Join in so the system can find like-minded readers.
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
                            Turn on <b>Participate</b> to see your match.
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
                                    Then you will see: match %, shared genres, shared mood, and cross recommendations.
                                </div>

                                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                                    <button
                                        type="button"
                                        style={ghostBtn}
                                        onClick={runMatch}
                                        disabled={matchLoading || participateLoading}
                                    >
                                        {matchLoading ? "Searching..." : "Search reader"}
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
                                            ? "There are no candidates yet (try another account with Participate turned on)."
                                            : "No match has been found yet."}
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
                                        {Array.isArray(normalizedMatch.sharedGenres) &&
                                        normalizedMatch.sharedGenres.length
                                            ? ` · Shared genres: ${normalizedMatch.sharedGenres.slice(0, 3).join(", ")}`
                                            : ""}
                                        {normalizedMatch.sharedMood
                                            ? ` · Shared mood: ${normalizedMatch.sharedMood}`
                                            : ""}
                                    </div>

                                    <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                                        {(Array.isArray(normalizedMatch.recommendations)
                                            ? normalizedMatch.recommendations
                                            : [])
                                            .slice(0, 5)
                                            .map((r, idx) => {
                                                const cover = r.coverId
                                                    ? `https://covers.openlibrary.org/b/id/${r.coverId}-M.jpg`
                                                    : (r.coverUrl || "");
                                                const subtitleText = `${r.author || "Author"}${r.reason ? ` · ${r.reason}` : ""}`;
                                                return (
                                                    <CardRow
                                                        key={(r.workKey || r.key || "") + idx}
                                                        coverUrl={cover}
                                                        titleText={r.title || `Recommendation ${idx + 1}`}
                                                        subtitleText={subtitleText}
                                                    />
                                                );
                                            })}

                                        {(!normalizedMatch.recommendations ||
                                            normalizedMatch.recommendations.length === 0) ? (
                                            <div style={{ color: MUTED, fontSize: 13 }}>
                                                There are no recommendations yet (try Search new reader).
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