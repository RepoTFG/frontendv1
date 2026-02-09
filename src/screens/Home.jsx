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
    return (
        <>
            {/* card búsqueda */}
            <div
                style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 18,
                    background: CARD,
                    padding: 14,
                }}
            >
                <div style={{ fontWeight: 900, color: ACCENT, marginBottom: 10 }}>
                    Buscar
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Título, autor o ISBN"
                        style={inputStyle}
                    />
                    <button onClick={buscarLibros} style={primaryBtn} type="button">
                        {/* cambiamos el texto del botón si está buscando */}
                        {searching ? "..." : "Buscar"}
                    </button>
                </div>
            </div>


            {/* resultados tipo cards */}
            {results.length > 0 && (
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
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
                                                    // si el libro ya pertenece a esa estantería -> estado activo (igual que BookDetail)
                                                    const active =
                                                        !!existingBook &&
                                                        Array.isArray(existingBook.shelves) &&
                                                        existingBook.shelves.includes(s);

                                                    return (
                                                        <button
                                                            key={s}
                                                            type="button"
                                                            onClick={() => {
                                                                // si el libro existe -> toggle real (igual que detalle libro)
                                                                if (existingBook?.id) {
                                                                    toggleBookShelf(existingBook.id, s);
                                                                    return;
                                                                }

                                                                // si NO existe -> lo creamos ya con esa shelf (y status por defecto)
                                                                addFromResult(doc, {
                                                                    status: addStatusByKey[doc.key] || "to_read",
                                                                    shelves: [s],
                                                                });
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
                                                            {s}
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
            <FinishedBookshelf items={finished} onPick={(b) => setSelectedBook(b)} styles={styles}/>
            <Section title="Currently reading" items={currentlyReading} onPick={(b) => setSelectedBook(b)} styles={styles}/>
        </>
    );
}
