// src/components/Section.jsx
export default function Section({ title, items, onPick, styles }) {
    const { ACCENT, SOFT, BORDER, MUTED } = styles;

    return (
        <div style={{ marginTop: 14 }}>
            {/* título de la sección --> flex: título a la izquierda */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                }}
            >
                <h2 style={{ margin: 0, fontSize: 16, letterSpacing: -0.2, color: ACCENT }}>
                    {title}
                </h2>
                <div style={{ fontSize: 12, color: MUTED, fontWeight: 800 }}>
                    {items.length}
                </div>
            </div>

            {/* si no hay libros --> mostramos texto */}
            {items.length === 0 ? (
                <p style={{ opacity: 0.7, marginTop: 10 }}>No hay libros aquí todavía</p>
            ) : (
                // grid con portadas (solo portada + texto, sin select/botones)
                <div
                    style={{
                        marginTop: 10,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", // adaptamos nº columnas al ancho disponible
                        gap: 14,
                    }}
                >
                    {items.map((book) => (
                        <div key={book.id} style={{ minWidth: 0 }}>
                            {/* si hay portada mostramos img --> si no, placeholder */}
                            {book.cover?.url ? (
                                <img
                                    src={book.cover.url} // url guardada en firestore
                                    alt={book.title}
                                    onClick={() => onPick?.(book)} // libro selaccionado -> abrir detalle
                                    style={{
                                        width: "100%",
                                        aspectRatio: "2 / 3",
                                        objectFit: "cover",
                                        borderRadius: 16,
                                        border: `1px solid ${BORDER}`,
                                        cursor: "pointer",
                                        background: SOFT,
                                    }}
                                />
                            ) : (
                                // placeholder cuando no portada
                                <div
                                    onClick={() => onPick?.(book)}
                                    style={{
                                        width: "100%",
                                        aspectRatio: "2 / 3",
                                        background: SOFT,
                                        borderRadius: 16,
                                        border: `1px solid ${BORDER}`,
                                        cursor: "pointer",
                                    }}
                                />
                            )}

                            {/* texto debajo de la portada */}
                            <div style={{ marginTop: 8, fontSize: 12, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        color: ACCENT,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {book.title}
                                </div>
                                <div
                                    style={{
                                        marginTop: 2,
                                        opacity: 0.6,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {book.author}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
