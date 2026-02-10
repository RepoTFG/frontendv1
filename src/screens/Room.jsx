import AmbientPlayer from "../components/AmbientPlayer";

export default function Room({
                                 user,
                                 styles,
                             }) {
    const { SOFT, BORDER, CARD, ACCENT, MUTED } = styles;

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



            {/* Fondo sonoro */}
            <AmbientPlayer styles={styles} />
        </>
    );
}
