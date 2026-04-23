export default function FinishedBookshelf({ items, onPick, styles }) {
    const { ACCENT, SOFT, CARD, BORDER, MUTED } = styles;

    const MAX = 150;
    const books = (Array.isArray(items) ? items : []).slice(0, MAX);

    const PALETTE = [
        "#E7D7C9",
        "#DCC7B5",
        "#CDB7A3",
        "#EADCCF",
        "#D9C9C0",
        "#C9B2A7",
        "#E3D0B9",
        "#D8C2A8",
        "#D1C6B8",
        "#CBB8B0",
        "#E6D6D6",
        "#D4CFC7",
    ];

    const pickColor = (i) => PALETTE[i % PALETTE.length];

    return (
        <div style={{ marginTop: 14 }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 10,
                }}
            >
                <h2 style={{ margin: 0, fontSize: 16, letterSpacing: -0.2, color: ACCENT }}>
                    Bookshelf
                </h2>
            </div>

            <div
                style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 18,
                    background: CARD,
                    padding: 14,
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        borderRadius: 14,
                        background: SOFT,
                        padding: 12,
                    }}
                >
                    {books.length === 0 ? (
                        <div style={{ color: MUTED, fontSize: 13, fontWeight: 700 }}>
                            Finished books will be here.
                        </div>
                    ) : (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-end",
                                    gap: 8,
                                    overflowX: "auto",
                                    paddingBottom: 10,
                                    WebkitOverflowScrolling: "touch",
                                }}
                            >
                                {books.map((b, idx) => {
                                    // cambiamos tamaño de los lomos(3 tamaños fijos)
                                    const HEIGHTS = [118, 124, 130];
                                    const WIDTHS = [26, 30, 33];
                                    const h = HEIGHTS[idx % HEIGHTS.length];
                                    const w = WIDTHS[idx % WIDTHS.length];

                                    return (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => onPick?.(b)}
                                            title={b.title}
                                            style={{
                                                height: h,
                                                width: w,
                                                border: `1px solid ${BORDER}`,
                                                borderRadius: 10,
                                                background: pickColor(idx),
                                                cursor: "pointer",
                                                padding: 0,
                                                flex: "0 0 auto",
                                                position: "relative",
                                                boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                                            }}
                                        >
                                            {/* texto rotado */}
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    left: "50%",
                                                    top: "50%",
                                                    transform: "translate(-50%, -50%) rotate(-90deg)",
                                                    width: h - 16,
                                                    textAlign: "center",
                                                    fontSize: 10,
                                                    fontWeight: 900,
                                                    color: ACCENT,
                                                    opacity: 0.92,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    padding: "0 6px",
                                                    pointerEvents: "none",
                                                }}
                                            >
                                                {b.title || "Sin título"}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* base de la balda */}
                            <div
                                style={{
                                    height: 10,
                                    borderRadius: 999,
                                    background: "rgba(47,42,36,0.12)",
                                }}
                            />
                        </>
                    )}
                </div>

                {books.length > 0 && (
                    <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>
                        Tap a spine to open the book.
                    </div>
                )}
            </div>
        </div>
    );
}