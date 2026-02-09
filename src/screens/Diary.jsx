export default function Diary({ BORDER, CARD, ACCENT, MUTED }) {
    return (
        <div
            style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 18,
                background: CARD,
                padding: 14,
            }}
        >
            <div style={{ fontWeight: 900, color: ACCENT }}>Diary</div>
            <div style={{ marginTop: 8, color: MUTED, fontSize: 13 }}>
                Abre un libro para escribir notas en su sección Diary.
            </div>
        </div>
    );
}
