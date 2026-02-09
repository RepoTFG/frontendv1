export default function TopBar({
                                   title,
                                   onLogout,
                                   styles,
                               }) {
    const { BORDER, ACCENT, container, smallGhostBtn } = styles;

    return (
        <div
            style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                background: "#FBFAF8",
                borderBottom: `1px solid ${BORDER}`,
            }}
        >
            <div
                style={{
                    ...container,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                }}
            >
                <div style={{ fontWeight: 900, fontSize: 18, color: ACCENT }}>
                    {title}
                </div>

                <button onClick={onLogout} style={smallGhostBtn} type="button">
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}
