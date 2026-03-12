export default function BottomNav({
                                      activeTab,
                                      setActiveTab,
                                      styles,
                                  }) {
    const { CARD, BORDER, ACCENT, MUTED } = styles;

    const tabs = [
        { key: "home", label: "Home", icon: "/icons/home_nav.png" },
        { key: "library", label: "Library", icon: "/icons/library_nav.png" },
        { key: "diary", label: "Diary", icon: "/icons/diary_nav.png" },
        { key: "discover", label: "Discover", icon: "/icons/discover_nav.png" },
        { key: "room", label: "Room", icon: "/icons/room_nav.png" },
    ];

    return (
        <div
            style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                background: CARD,
                borderTop: `1px solid ${BORDER}`,
                paddingBottom: "max(10px, env(safe-area-inset-bottom))",
                zIndex: 20,
            }}
        >
            <div
                style={{
                    maxWidth: 520,
                    margin: "0 auto",
                    padding: "10px 16px",
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: 4,
                }}
            >
                {tabs.map((t) => {
                    const active = activeTab === t.key;

                    return (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            type="button"
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                padding: "8px 6px",
                                borderRadius: 12,
                                color: active ? ACCENT : MUTED,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                minHeight: 58,
                            }}
                        >
                            <img
                                src={t.icon}
                                alt={t.label}
                                style={{
                                    width: active ? 26 : 24,
                                    height: active ? 26 : 24,
                                    objectFit: "contain",
                                    opacity: active ? 1 : 0.58,
                                    display: "block",
                                    transition: "all 0.18s ease",
                                }}
                            />
                            <div
                                style={{
                                    fontSize: 12,
                                    lineHeight: "12px",
                                    fontWeight: active ? 900 : 700,
                                }}
                            >
                                {t.label}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}