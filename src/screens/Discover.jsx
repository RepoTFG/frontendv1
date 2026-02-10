export default function Discover({
                                     BORDER,
                                     CARD,
                                     ACCENT,
                                     MUTED,
                                     ghostBtn,
                                     probarMe,
                                     listarLibros,
                                 }) {
    return (
        <div
            style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 18,
                background: CARD,
                padding: 14,
            }}
        >
            <div style={{ fontWeight: 900, color: ACCENT }}>Discover</div>
            <div style={{ marginTop: 8, color: MUTED, fontSize: 13 }}>
                Aquí poner recomendaciones...
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={probarMe} style={ghostBtn} type="button">
                    Probar /api/me
                </button>
            </div>
        </div>
    );
}
