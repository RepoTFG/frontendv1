export default function BottomNav({
                                      activeTab,
                                      setActiveTab,
                                      styles,
                                  }) {
    const { CARD, BORDER, ACCENT, MUTED } = styles;

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
                    gap: 6,
                }}
            >
                {[
                    { key: "home", label: "Home", icon: "⌂" },
                    { key: "library", label: "Library", icon: "≡" },
                    { key: "diary", label: "Diary", icon: "▦" },
                    { key: "discover", label: "Discover", icon: "✦" },
                    { key: "room", label: "Room", icon: "☺" },
                ].map((t) => {
                    const active = activeTab === t.key;

                    return (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                padding: "6px 8px",
                                borderRadius: 12,
                                color: active ? ACCENT : MUTED,
                                fontWeight: active ? 900 : 800,
                            }}
                            type="button"
                        >
                            <div style={{ fontSize: 18, lineHeight: "18px" }}>{t.icon}</div>
                            <div style={{ fontSize: 11, marginTop: 6 }}>{t.label}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
