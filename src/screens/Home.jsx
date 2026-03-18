import { useEffect, useRef, useState } from "react";
import Section from "../components/Section";
import FinishedBookshelf from "../components/FinishedBookshelf";

export default function Home({
                                 // data
                                 results,
                                 searching,
                                 query,
                                 setQuery,
                                 customShelves,
                                 addStatusByKey,
                                 setAddStatusByKey,
                                 books,
                                 finished,
                                 currentlyReading,

                                 // actions
                                 buscarLibros,
                                 addFromResult,
                                 toggleBookShelf,
                                 setSelectedBook,
                                 setActiveTab,

                                 // styles
                                 styles,
                                 inputStyle,
                                 primaryBtn,
                                 SOFT,
                                 BORDER,
                                 CARD,
                                 ACCENT,
                                 MUTED,

                             }) {

    const [resultsOpen, setResultsOpen] = useState(false);
    const debounceRef = useRef(null);
    const lastQueryRef = useRef("");

    useEffect(() => {
        if (!query.trim()) setResultsOpen(false);
    }, [query]);

    useEffect(() => {
        const q = query.trim();

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (q.length < 2) {
            lastQueryRef.current = q;
            return;
        }

        debounceRef.current = setTimeout(() => {
            if (lastQueryRef.current === q) return;
            lastQueryRef.current = q;
            buscarLibros();
            setResultsOpen(true);
        }, 350);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, buscarLibros]);

    const homeCard = {
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        background: CARD,
        padding: 14,
    };

    const smallLabel = {
        fontSize: 12,
        fontWeight: 800,
        color: MUTED,
        marginBottom: 8,
        letterSpacing: "0.01em",
    };

    return (
        <>
            <div
                style={{
                    marginBottom: 18,
                }}
            >
                <div
                    style={{
                        color: ACCENT,
                        fontWeight: 900,
                        fontSize: 30,
                        lineHeight: 1.05,
                        letterSpacing: "-0.03em",
                    }}
                >
                    Welcome to Readroom
                </div>

                <div
                    style={{
                        marginTop: 8,
                        color: MUTED,
                        fontSize: 14,
                        lineHeight: 1.45,
                        maxWidth: 520,
                    }}
                >
                    A quieter space for reading, reflection, and keeping books close to you.
                </div>
            </div>

            {/* card búsqueda */}
            <div
                style={{
                    ...homeCard,
                    padding: 16,
                }}
            >
                <div style={{ fontWeight: 900, color: ACCENT, marginBottom: 12, fontSize: 24 }}>
                    Find a book
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Title, author or ISBN"
                        style={inputStyle}
                    />
                    <button
                        onClick={() => {
                            buscarLibros();
                            setResultsOpen(true);
                        }}
                        style={primaryBtn}
                        type="button"
                    >
                        {/* cambiamos el texto del botón si está buscando */}
                        {searching ? "..." : "Search"}
                    </button>
                </div>
            </div>

            {/* resultados tipo cards */}
            {results.length > 0 && (
                <div style={{ marginTop: 14 }}>
                    <div
                        style={{
                            border: `1px solid ${BORDER}`,
                            borderRadius: 18,
                            background: CARD,
                            padding: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 10,
                        }}
                    >
                        <div style={{ fontWeight: 900, color: ACCENT }}>
                            Results ({results.length})
                        </div>

                        {resultsOpen ? (
                            <button
                                type="button"
                                onClick={() => setResultsOpen(false)}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 999,
                                    border: `1px solid ${BORDER}`,
                                    background: CARD,
                                    cursor: "pointer",
                                    fontWeight: 900,
                                    color: ACCENT,
                                }}
                                title="Ocultar resultados"
                                aria-label="Ocultar resultados"
                            >
                                ✕
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setResultsOpen(true)}
                                style={{
                                    padding: "10px 12px",
                                    borderRadius: 999,
                                    border: `1px solid ${BORDER}`,
                                    background: CARD,
                                    cursor: "pointer",
                                    fontWeight: 900,
                                    color: ACCENT,
                                    whiteSpace: "nowrap",
                                }}
                                title="Mostrar resultados"
                                aria-label="Mostrar resultados"
                            >
                                Show results
                            </button>
                        )}
                    </div>

                    {resultsOpen && (
                        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                            {results.map((doc) => {
                                // portada "M" (mediana) para mostrar en resultados
                                const cover = doc.cover_i
                                    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
                                    : null;

                                const author = (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : "Autor desconocido";
                                //const currentStatus = addStatusByKey[doc.key] || "to_read";
                                // buscar si este resultado ya existe en mi biblioteca (para marcar shelves activas)
                                const existingByCover = doc.cover_i
                                    ? books.find((b) => b?.cover?.openLibraryCoverId === doc.cover_i)
                                    : null;

                                const titleNormalized = (doc.title || "").trim().toLowerCase();
                                const authorNormalized = (
                                    (doc.author_name && doc.author_name[0]) ? doc.author_name[0] : ""
                                ).trim().toLowerCase();

                                const existingByText = books.find((b) => {
                                    const bt = (b.title || "").trim().toLowerCase();
                                    const ba = (b.author || "").trim().toLowerCase();
                                    return bt === titleNormalized && ba === authorNormalized;
                                });

                                const existingBook = existingByCover || existingByText;

                                return (
                                    <div
                                        key={doc.key}
                                        style={{
                                            border: `1px solid ${BORDER}`,
                                            borderRadius: 18,
                                            background: CARD,
                                            padding: 12,
                                            display: "flex",
                                            gap: 12,
                                        }}
                                    >
                                        {cover ? (
                                            <img
                                                src={cover}
                                                alt="Portada"
                                                style={{ width: 56, height: 84, objectFit: "cover", borderRadius: 12, border: `1px solid ${BORDER}` }}
                                            />
                                        ) : (
                                            <div style={{ width: 56, height: 84, background: SOFT, borderRadius: 12, border: `1px solid ${BORDER}` }} />
                                        )}

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontWeight: 900,
                                                    color: ACCENT,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {doc.title}
                                            </div>
                                            <div style={{ marginTop: 4, color: MUTED, fontSize: 12 }}>{author}</div>

                                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                    {[
                                                        { key: "to_read", label: "Want to read" },
                                                        { key: "reading", label: "Currently reading" },
                                                        { key: "paused", label: "Interrupted" },
                                                        { key: "finished", label: "Finished" },
                                                    ].map((opt) => {
                                                        const active = (addStatusByKey[doc.key] || "") === opt.key;

                                                        return (
                                                            <button
                                                                key={opt.key}
                                                                type="button"
                                                                onClick={() => {
                                                                    // guardamos status seleccionado (UI)
                                                                    setAddStatusByKey((prev) => ({ ...prev, [doc.key]: opt.key }));

                                                                    // acción inmediata (como en detalle libro)
                                                                    addFromResult(doc, { status: opt.key });

                                                                    setResultsOpen(false);
                                                                }}
                                                                style={{
                                                                    padding: "8px 10px",
                                                                    borderRadius: 999,
                                                                    border: `1px solid ${active ? ACCENT : BORDER}`,
                                                                    background: active ? ACCENT : CARD,
                                                                    color: active ? "white" : ACCENT,
                                                                    fontWeight: active ? 800 : 600,
                                                                    cursor: "pointer",
                                                                    fontSize: 12,
                                                                    lineHeight: "16px",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                            </div>

                                            {customShelves.length > 0 && (
                                                <div style={{ marginTop: 10 }}>
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            color: MUTED,
                                                            fontWeight: 800,
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        Añadir también a...
                                                    </div>

                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                        {customShelves.map((s) => {
                                                            const shelfName = typeof s === "string" ? s : s?.name || "";
                                                            const shelfKey = typeof s === "string" ? s : s?.id || shelfName;

                                                            if (!shelfName) return null;

                                                            // si el libro ya pertenece a esa estantería -> estado activo (igual que BookDetail)
                                                            const active =
                                                                !!existingBook &&
                                                                Array.isArray(existingBook.shelves) &&
                                                                existingBook.shelves.includes(shelfName);

                                                            return (
                                                                <button
                                                                    key={shelfKey}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        // si el libro existe -> toggle real (igual que detalle libro)
                                                                        if (existingBook?.id) {
                                                                            toggleBookShelf(existingBook.id, shelfName);
                                                                            setResultsOpen(false);
                                                                            return;
                                                                        }

                                                                        // si NO existe -> lo creamos ya con esa shelf (y status por defecto)
                                                                        addFromResult(doc, {
                                                                            status: addStatusByKey[doc.key] || "to_read",
                                                                            shelves: [shelfName],
                                                                        });

                                                                        setResultsOpen(false);
                                                                    }}
                                                                    style={{
                                                                        padding: "8px 10px",
                                                                        borderRadius: 999,
                                                                        border: `1px solid ${active ? ACCENT : BORDER}`,
                                                                        background: active ? SOFT : CARD,
                                                                        fontWeight: active ? 900 : 700,
                                                                        cursor: "pointer",
                                                                        color: ACCENT,
                                                                        fontSize: 12,
                                                                    }}
                                                                    title={active ? "Quitar de esta shelf" : "Añadir a esta shelf"}
                                                                >
                                                                    {shelfName}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            <div style={{ marginTop: 18 }}>
                <div style={smallLabel}>Continue reading</div>
                <div
                    style={{
                        ...homeCard,
                        padding: 12,
                    }}
                >
                    <Section title="" items={currentlyReading} onPick={(b) => setSelectedBook(b)} styles={styles}/>
                </div>
            </div>

            <div style={{ marginTop: 18 }}>
                <div style={smallLabel}>For this moment</div>

                <div
                    style={{
                        display: "flex",
                        gap: 10,
                        overflowX: "auto",
                        paddingBottom: 4,
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {[
                        {
                            key: "diary",
                            label: "Reflect",
                            sub: "Open diary",
                        },
                        {
                            key: "discover",
                            label: "Explore",
                            sub: "Open discover",
                        },
                        {
                            key: "room",
                            label: "Relax",
                            sub: "Open room",
                        },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setActiveTab(item.key)}
                            style={{
                                minWidth: 150,
                                border: `1px solid ${BORDER}`,
                                borderRadius: 18,
                                background: SOFT,
                                padding: 14,
                                textAlign: "left",
                                cursor: "pointer",
                                flex: "0 0 auto",
                            }}
                        >
                            <div
                                style={{
                                    color: ACCENT,
                                    fontWeight: 900,
                                    fontSize: 18,
                                    lineHeight: 1.1,
                                }}
                            >
                                {item.label}
                            </div>

                            <div
                                style={{
                                    marginTop: 8,
                                    color: MUTED,
                                    fontSize: 13,
                                    lineHeight: 1.3,
                                }}
                            >
                                {item.sub}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: 18 }}>
                <div style={smallLabel}>Finished</div>
                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 24,
                        background: CARD,
                        padding: 10,
                    }}
                >
                    <FinishedBookshelf items={finished} onPick={(b) => setSelectedBook(b)} styles={styles}/>
                </div>
            </div>
        </>
    );
}