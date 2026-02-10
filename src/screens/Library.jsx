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

    return (
        <>
            <Section
                title="Currently reading"
                items={currentlyReading}
                onPick={(b) => setSelectedBook(b)}
                styles={styles}
            />
            <Section
                title="Want to read"
                items={wantToRead}
                onPick={(b) => setSelectedBook(b)}
                styles={styles}
            />
            <Section
                title="Interrupted"
                items={interrupted}
                onPick={(b) => setSelectedBook(b)}
                styles={styles}
            />
            <Section
                title="Finished"
                items={finished}
                onPick={(b) => setSelectedBook(b)}
                styles={styles}
            />

            <div style={{ marginTop: 14 }}>
                <h3 style={{ margin: "0 0 10px 0", color: ACCENT }}>Custom shelves</h3>

                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 18,
                        padding: 14,
                        background: CARD,
                    }}
                >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input
                            value={newShelfName}
                            onChange={(e) => setNewShelfName(e.target.value)}
                            placeholder="Nombre de la shelf"
                            style={inputStyle}
                        />

                        <button onClick={crearShelf} style={primaryBtn} title="Crear shelf" type="button">
                            + Crear
                        </button>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        {!Array.isArray(customShelves) || customShelves.length === 0 ? (
                            <div style={{ opacity: 0.7, fontSize: 13 }}>
                                Aún no hay shelves personalizadas.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {customShelves.map((shelf) => (
                                    <div
                                        key={shelf.id}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            padding: "8px 10px",
                                            borderRadius: 999,
                                            border: `1px solid ${BORDER}`,
                                            background: SOFT,
                                            fontSize: 12,
                                            fontWeight: 900,
                                            color: ACCENT,
                                        }}
                                        title="Shelf personalizada"
                                    >
                                        <span>{shelf.name}</span>

                                        <button
                                            type="button"
                                            onClick={() => borrarShelf(shelf)}
                                            title="Eliminar shelf"
                                            style={{
                                                border: "none",
                                                background: "transparent",
                                                cursor: "pointer",
                                                color: MUTED,
                                                fontSize: 12,
                                                lineHeight: 1,
                                                padding: 0,
                                                marginLeft: 2,
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {Array.isArray(customSections) &&
                customSections.map((sec) => (
                    <Section
                        key={sec.name}
                        title={sec.name}
                        items={sec.items}
                        onPick={(b) => setSelectedBook(b)}
                        styles={styles}
                    />
                ))}
        </>
    );
}
