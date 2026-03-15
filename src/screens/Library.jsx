import { useEffect, useState } from "react";
import Section from "../components/Section";

export default function Library({
                                    currentlyReading,
                                    wantToRead,
                                    interrupted,
                                    finished,
                                    customSections,
                                    setSelectedBook,
                                    styles,
                                    newShelfName,
                                    setNewShelfName,
                                    customShelves,
                                    crearShelf,
                                    inputStyle,
                                    primaryBtn,
                                    borrarShelf,
                                }) {
    const { SOFT, BORDER, CARD, ACCENT, MUTED } = styles;
    // guardamos pestaña que está activa de "my shelves" (want to read, finished o interrupted)
    const [activeMainTab, setActiveMainTab] = useState("want");
    // guardamos nombre custom shelf
    const [activeCustomShelf, setActiveCustomShelf] = useState(null);
    // controlamos si está visible crear shelf personalizada o no
    const [showCreateShelf, setShowCreateShelf] = useState(false);

    // elegir que custom shelf está activa
    useEffect(() => {
        // si no hay ninguna seleccionada, pero existe --> muestra la 1a
        if (!activeCustomShelf && customSections.length > 0) {
            setActiveCustomShelf(customSections[0].name);
            return;
        }
        // si había una shelf seleccionada pero ya no existe --> 1a disponible
        if (
            activeCustomShelf &&
            customSections.length > 0 &&
            !customSections.some((sec) => sec.name === activeCustomShelf)
        ) {
            setActiveCustomShelf(customSections[0].name);
            return;
        }
        // si no hay --> null
        if (customSections.length === 0 && activeCustomShelf) {
            setActiveCustomShelf(null);
        }
    }, [activeCustomShelf, customSections]);

    // "my shelves"
    const mainTabs = [
        { key: "want", label: "Want to read", items: wantToRead },
        { key: "finished", label: "Finished", items: finished },
        { key: "interrupted", label: "Interrupted", items: interrupted },
    ];
    // "my shelves": ver que tab activa, si no hay ninguna --> usa 1a
    const activeMainSection =
        mainTabs.find((t) => t.key === activeMainTab) || mainTabs[0];
    // "custom shelves" --> si hay se muestra, si no null
    const activeCustomSection = activeCustomShelf
        ? customSections.find((sec) => sec.name === activeCustomShelf) || null
        : null;
    // helpers para sacar datos de libros
    const getBookTitle = (book) =>
        book?.title || book?.name || book?.bookTitle || "Untitled";
    const getBookAuthor = (book) =>
        book?.author || book?.authors || book?.writer || "";
    const getBookId = (book, idx = 0) =>
        book?._id || book?.id || `${getBookTitle(book)}-${idx}`;
    const getBookCover = (book) =>
        book?.cover?.url ||
        book?.coverUrl ||
        book?.image ||
        book?.imageUrl ||
        book?.thumbnail ||
        book?.thumbnailUrl ||
        book?.poster ||
        book?.photo ||
        "";

    // contar libros custom shelf
    const getShelfCount = (shelfName) => {
        const section = customSections.find((sec) => sec.name === shelfName);
        return Array.isArray(section?.items) ? section.items.length : 0;
    };
    // devolvemos 3 libros de esa custom shelf
    const getShelfPreview = (shelfName) => {
        const section = customSections.find((sec) => sec.name === shelfName);
        return Array.isArray(section?.items) ? section.items.slice(0, 3) : [];
    };
    // estilo contador
    const countPill = {
        minWidth: 26,
        height: 26,
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 9px",
        border: `1px solid ${BORDER}`,
        background: SOFT,
        color: ACCENT,
        fontSize: 12,
        fontWeight: 900,
        flexShrink: 0,
    };
    // creamos la fila del titulo para luego reutilizar, opcional algo a la derecha (+ New shelf)
    const sectionTitleRow = (title, count, rightNode = null) => (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <h3
                    style={{
                        margin: 0,
                        color: ACCENT,
                        fontSize: 24,
                        lineHeight: 1.1,
                        letterSpacing: "-0.02em",
                    }}
                >
                    {title}
                </h3>
                <div style={countPill}>{count}</div>
            </div>
            {rightNode}
        </div>
    );
    // distinto estilo si está la tab activa o no
    const tabBtn = (active) => ({
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? ACCENT : CARD,
        color: active ? "white" : ACCENT,
        borderRadius: 999,
        padding: "10px 14px",
        fontWeight: 800,
        fontSize: 13,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
    });
    // renderizamos portadas
    const renderCover = (book, idx, width, height, radius = 18, compact = false) => {
        const title = getBookTitle(book);
        const cover = getBookCover(book);

        return (
            <div
                style={{
                    width,
                    height,
                    borderRadius: radius,
                    overflow: "hidden",
                    background: SOFT,
                    border: `1px solid ${BORDER}`,
                    boxShadow: compact ? "none" : "0 6px 18px rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {cover ? (
                    <img
                        src={cover}
                        alt={title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                        }}
                    />
                ) : (
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            padding: compact ? 6 : 14,
                            display: "flex",
                            alignItems: "flex-end",
                            background: `linear-gradient(180deg, ${SOFT} 0%, white 100%)`,
                        }}
                    >
                        <div
                            style={{
                                color: ACCENT,
                                fontWeight: 900,
                                fontSize: compact ? 10 : 14,
                                lineHeight: 1.2,
                                wordBreak: "break-word",
                            }}
                        >
                            {title}
                        </div>
                    </div>
                )}
            </div>
        );
    };
    // fila horizontal de libros
    const renderBookRow = (items) => {
        if (!items || items.length === 0) {
            return (
                <div
                    style={{
                        border: `1px dashed ${BORDER}`,
                        borderRadius: 18,
                        background: CARD,
                        padding: 18,
                        color: MUTED,
                        fontSize: 14,
                    }}
                >
                    No books here yet.
                </div>
            );
        }

        return (
            <div
                style={{
                    display: "flex",
                    gap: 14,
                    overflowX: "auto", // scroll horizontal
                    paddingBottom: 4,
                    WebkitOverflowScrolling: "touch",
                }}
            >
                {items.map((book, idx) => {
                    const title = getBookTitle(book);
                    const author = getBookAuthor(book);

                    return (
                        <button
                            key={getBookId(book, idx)}
                            type="button"
                            onClick={() => setSelectedBook(book)}
                            style={{
                                minWidth: 146,
                                maxWidth: 146,
                                background: "transparent",
                                border: "none",
                                padding: 0,
                                textAlign: "left",
                                cursor: "pointer",
                            }}
                        >
                            {renderCover(book, idx, 146, 214, 18)}

                            <div style={{ marginTop: 10 }}>
                                <div
                                    style={{
                                        fontWeight: 900,
                                        color: ACCENT,
                                        fontSize: 15,
                                        lineHeight: 1.2,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}
                                >
                                    {title}
                                </div>
                                <div
                                    style={{
                                        marginTop: 4,
                                        color: MUTED,
                                        fontSize: 14,
                                        lineHeight: 1.2,
                                        display: "-webkit-box",
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                    }}
                                >
                                    {author}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        // sección currently reading, my shelves y custom shelves
        <>

            <div style={{ marginTop: 18 }}>
                {sectionTitleRow("Currently reading", currentlyReading.length)}
                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 24,
                        background: CARD,
                        padding: 14,
                    }}
                >
                    {renderBookRow(currentlyReading)}
                </div>
            </div>

            <div style={{ marginTop: 22 }}>
                {sectionTitleRow("My shelves", activeMainSection?.items?.length || 0)}
                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 24,
                        background: CARD,
                        padding: 14,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            overflowX: "auto",
                            paddingBottom: 6,
                            marginBottom: 14,
                        }}
                    >
                        {mainTabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveMainTab(tab.key)}
                                style={tabBtn(activeMainTab === tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {renderBookRow(activeMainSection?.items || [])}
                </div>
            </div>

            <div style={{ marginTop: 22 }}>
                {sectionTitleRow(
                    "Custom shelves",
                    customShelves.length,
                    <button
                        type="button"
                        onClick={() => setShowCreateShelf((v) => !v)}
                        style={{
                            border: `1px solid ${showCreateShelf ? ACCENT : BORDER}`,
                            background: showCreateShelf ? SOFT : CARD,
                            color: ACCENT,
                            borderRadius: 999,
                            padding: "10px 14px",
                            fontWeight: 900,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {showCreateShelf ? "Close" : "+ New shelf"}
                    </button>
                )}

                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 24,
                        background: CARD,
                        padding: 14,
                    }}
                >
                    {showCreateShelf && (
                        <div
                            style={{
                                padding: 12,
                                border: `1px solid ${BORDER}`,
                                borderRadius: 18,
                                background: SOFT,
                                marginBottom: 14,
                            }}
                        >
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <input
                                    value={newShelfName}
                                    onChange={(e) => setNewShelfName(e.target.value)}
                                    placeholder="Nombre de la shelf"
                                    style={{
                                        ...inputStyle,
                                        flex: 1,
                                        minWidth: 0,
                                        background: "white",
                                    }}
                                />

                                <button
                                    onClick={crearShelf}
                                    style={primaryBtn}
                                    title="Crear shelf"
                                    type="button"
                                >
                                    + Crear
                                </button>
                            </div>
                        </div>
                    )}

                    {customShelves.length === 0 ? (
                        <div
                            style={{
                                border: `1px dashed ${BORDER}`,
                                borderRadius: 18,
                                padding: 18,
                                color: MUTED,
                                fontSize: 14,
                            }}
                        >
                            Aún no hay shelves personalizadas.
                        </div>
                    ) : (
                        <>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                    gap: 10,
                                }}
                            >
                                {customShelves.map((shelf, idx) => {
                                    const isActive = activeCustomShelf === shelf.name;
                                    const count = getShelfCount(shelf.name);
                                    const preview = getShelfPreview(shelf.name);

                                    return (
                                        <button
                                            key={shelf.id || `${shelf.name}-${idx}`}
                                            type="button"
                                            onClick={() => setActiveCustomShelf(shelf.name)}
                                            style={{
                                                border: `1px solid ${isActive ? ACCENT : BORDER}`,
                                                borderRadius: 18,
                                                background: isActive ? SOFT : CARD,
                                                padding: 12,
                                                cursor: "pointer",
                                                textAlign: "left",
                                                minWidth: 0,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "start",
                                                    justifyContent: "space-between",
                                                    gap: 8,
                                                }}
                                            >
                                                <div style={{ minWidth: 0 }}>
                                                    <div
                                                        style={{
                                                            color: ACCENT,
                                                            fontWeight: 900,
                                                            fontSize: 14,
                                                            lineHeight: 1.2,
                                                            wordBreak: "break-word",
                                                        }}
                                                    >
                                                        {shelf.name}
                                                    </div>
                                                    <div
                                                        style={{
                                                            marginTop: 5,
                                                            color: MUTED,
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {count} {count === 1 ? "book" : "books"}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        borrarShelf(shelf);
                                                    }}
                                                    title="Eliminar shelf"
                                                    style={{
                                                        border: "none",
                                                        background: "transparent",
                                                        cursor: "pointer",
                                                        color: MUTED,
                                                        fontSize: 14,
                                                        lineHeight: 1,
                                                        padding: 2,
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: 12,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    minHeight: 42,
                                                }}
                                            >
                                                {preview.length > 0 ? (
                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                        {preview.map((book, previewIdx) => (
                                                            <div
                                                                key={getBookId(book, previewIdx)}
                                                                style={{
                                                                    width: 34,
                                                                    height: 42,
                                                                    marginLeft: previewIdx === 0 ? 0 : -8,
                                                                }}
                                                            >
                                                                {renderCover(
                                                                    book,
                                                                    previewIdx,
                                                                    34,
                                                                    42,
                                                                    8,
                                                                    true
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div
                                                        style={{
                                                            color: MUTED,
                                                            fontSize: 12,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Empty shelf
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {activeCustomSection && (
                                <div style={{ marginTop: 16 }}>
                                    <Section
                                        title={activeCustomSection.name}
                                        items={activeCustomSection.items}
                                        onPick={(b) => setSelectedBook(b)}
                                        styles={styles}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}