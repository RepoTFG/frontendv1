export default function Room({
                                 user,

                                 // shelves
                                 newShelfName,
                                 setNewShelfName,
                                 customShelves,
                                 crearShelf,

                                 // styles
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
            <div
                style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 18,
                    background: CARD,
                    padding: 14,
                }}
            >
                <div style={{ fontWeight: 900, color: ACCENT }}>ReadRoom</div>
                <div style={{ marginTop: 6, color: MUTED, fontSize: 12 }}>
                    Sesión iniciada: {user.email} {/* luego cambiar por nickname o algo así */}
                </div>
            </div>

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

                        <button
                            onClick={crearShelf}
                            style={primaryBtn}
                            title="Crear shelf"
                            type="button"
                        >
                            ➕ Crear
                        </button>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        {customShelves.length === 0 ? (
                            <div style={{ opacity: 0.7, fontSize: 13 }}>
                                Aún no hay shelves personalizadas.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                {customShelves.map((s) => (
                                    <div
                                        key={s}
                                        style={{
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
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
