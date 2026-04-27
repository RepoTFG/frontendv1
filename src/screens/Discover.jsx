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
  const [tab, setTab] = useState("for_you"); // for_you, reviews

  const tabs = useMemo(
      () => [
        { key: "for_you", label: "For you" },
        { key: "reviews", label: "Reviews" },

      ],
      []
  );

  // book of the day AI
  const [bookOfDayAI, setBookOfDayAI] = useState(null);
  const [bookOfDayAILoading, setBookOfDayAILoading] = useState(false);
  const [bookOfDayAIFeedback, setBookOfDayAIFeedback] = useState(0); // 1 like, -1 dislike, 0 none
  const [bookOfDayAIFeedbackLoading, setBookOfDayAIFeedbackLoading] = useState(false);
  const [aiRevealed, setAiRevealed] = useState(false);
  const [aiAnimating, setAiAnimating] = useState(false);

  const bookOfDayAIData = useMemo(() => {
      const titleText = bookOfDayAI?.title || "";
      const authorText = bookOfDayAI?.author || "";
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
    const day = bookOfDayAI?.day || new Date().toISOString().slice(0, 10);

    return `discover_ai_revealed_${day}`;
  }, [bookOfDayAI?.day]);

  // reviews feed
  const [reviewsFeed, setReviewsFeed] = useState([]);
  const [reviewsFeedLoading, setReviewsFeedLoading] = useState(false);
  const [reviewsFeedError, setReviewsFeedError] = useState("");
  const [reviewsQuery, setReviewsQuery] = useState("");

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

  useEffect(() => {
    if (bookOfDayAI) {
      loadAIFeedback();
    }
  }, [bookOfDayAI]);

  useEffect(() => {
      setAiAnimating(false);
      setBookOfDayAIFeedback(0);
      const alreadyRevealed = localStorage.getItem(revealStorageKey) === "true";
      if (alreadyRevealed) {
          loadBookOfDayAI();
      } else {
          setAiRevealed(false);
      }
      }, [revealStorageKey]);

  useEffect(() => {
      const alreadyRevealed = localStorage.getItem(revealStorageKey) === "true";
      if (alreadyRevealed && bookOfDayAI) {
          setAiRevealed(true);
      }
      }, [bookOfDayAI, revealStorageKey]);

  useEffect(() => {
      if (tab !== "reviews") return;
      loadReviewsFeed("");
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
          let data = bookOfDayAI;
          if (!data) {
              data = await loadBookOfDayAI();
          }

          if (!data) return;
          setAiAnimating(true);
          setTimeout(() => {
              setAiRevealed(true);
              setAiAnimating(false);
            }, 320);
      } catch (e) {
          console.error(e);
          setAiAnimating(false);
      }
  };

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
                disabled={loading || animating}
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
                  {(!revealed || !revealedCoverUrl) && !animating ? (
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

  return (
      <div style={sectionWrap}>
        <div style={title}>Discover</div>
        <div style={sub}>Recommendations, mood, and reviews.</div>

        {/* tabs (for you, mood, reviews) */}
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
      </div>
  );
}