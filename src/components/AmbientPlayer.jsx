import { useEffect, useMemo, useRef, useState } from "react";

export default function AmbientPlayer({
                                          styles,
                                          selectedAtmosphere = "rain", // por defecto
                                          setSelectedAtmosphere,
                                          sessionActive = false,
                                          soundMode = "default", // upload o spotify
                                          spotifyInput, // link spotify
                                          setSpotifyInput, // actualizamos el input
                                          spotifyUrl, // link --> embed
                                          setSpotifyUrl, // guardamos embed
                                          localUrl, // archivo local
                                          setLocalUrl,
                                          extractSpotifyEmbedUrl, // convertimos link a embebible
                                      }) {
    const { ACCENT, SOFT, CARD, BORDER, MUTED } = styles;

    const audioElRef = useRef(null); // archivo local
    const ambienceElRef = useRef(null); // sonido ambiente

    const [localPlaying, setLocalPlaying] = useState(false); // si archivo local se está reproduciendo
    const [localVol] = useState(0.6); // volumen audio local
    const [localLoop, setLocalLoop] = useState(true); // repetir audio local
    const [ambienceVol, setAmbienceVol] = useState(0.45); // cambiar volumen ambiente
    const [ambiencePlaying, setAmbiencePlaying] = useState(false);

    // sonidos ambientes (se encuentran en public)
    const ambienceMap = useMemo(
        () => ({
            rain: {
                label: "Rain",
                url: "/rain.mp3",
            },
            forest: {
                label: "Forest",
                url: "/forest.mp3",
            },
            fireplace: {
                label: "Fireplace",
                url: "/fireplace.mp3",
            },
        }),
        []
    );

    // audio ambiente seleccionado (cae en rain como fallback)
    const currentAmbience = ambienceMap[selectedAtmosphere] || ambienceMap.rain;

    // limpiamos memoria:
    useEffect(() => {
        return () => {
            if (localUrl) URL.revokeObjectURL(localUrl);
        };
    }, [localUrl]);

    // sonido ambiente:
    useEffect(() => {
        const el = ambienceElRef.current;
        if (!el) return;

        el.volume = ambienceVol;

        // si no está en modo default el audio no debe sonar
        if (soundMode !== "default") {
            el.pause();
            setAmbiencePlaying(false);
            return;
        }

        // reproducir o pausar
        if (sessionActive) {
            el.play()
                .then(() => {
                    setAmbiencePlaying(true);
                })
                .catch(() => {
                    setAmbiencePlaying(false);
                });
        } else {
            el.pause();
            setAmbiencePlaying(false);
        }
    }, [sessionActive, selectedAtmosphere, ambienceVol, soundMode]);

    // audio subido local
    useEffect(() => {
        const el = audioElRef.current;
        if (!el) return;

        if (soundMode !== "upload") {
            el.pause();
            setLocalPlaying(false);
            return;
        }

        el.volume = localVol;
        el.loop = localLoop;

        if (sessionActive && localUrl) {
            el.play()
                .then(() => {
                    setLocalPlaying(true);
                })
                .catch(() => {
                    setLocalPlaying(false);
                });
        } else {
            el.pause();
            setLocalPlaying(false);
        }
    }, [sessionActive, localUrl, localVol, localLoop, soundMode]);

    const inputStyle = {
        padding: 12,
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: SOFT,
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
        fontSize: 14,
    };

    const subtleBtn = {
        padding: "10px 12px",
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: CARD,
        color: ACCENT,
        fontWeight: 800,
        cursor: "pointer",
    };

    const softPrimaryBtn = {
        padding: "10px 12px",
        borderRadius: 14,
        border: `1px solid ${ACCENT}`,
        background: SOFT,
        color: ACCENT,
        fontWeight: 900,
        cursor: "pointer",
    };

    const sliderStyle = {
        width: "100%",
        marginTop: 8,
        accentColor: ACCENT,
        cursor: "pointer",
    };

    // tarjetas de ambiente
    const atmosphereCard = (active, disabled = false) => ({
        textAlign: "left",
        padding: 12,
        borderRadius: 14,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? SOFT : CARD,
        color: ACCENT,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        minWidth: 120,
    });

    if (soundMode === "default") {
        return (
            <div
                style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 16,
                    background: CARD,
                    padding: 12,
                    display: "grid",
                    gap: 12,
                }}
            >
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {/* botones: rain, forest, fireplace */}
                    {Object.entries(ambienceMap).map(([id, item]) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedAtmosphere(id)}
                            style={atmosphereCard(selectedAtmosphere === id, sessionActive)}
                            disabled={sessionActive}
                        >
                            <div style={{ fontWeight: 900, fontSize: 13 }}>
                                {item.label} {/* mostramos el nombre */}
                            </div>
                        </button>
                    ))}
                </div>

                {/* audio sonido ambiente */}
                <audio
                    ref={ambienceElRef}
                    src={currentAmbience.url}
                    loop
                    onPlay={() => setAmbiencePlaying(true)}
                    onPause={() => setAmbiencePlaying(false)}
                    style={{ display: "none" }}
                />

                {/* slider volumen ambiente */}
                <div>
                    {/* leemos valor, convertimos a número y guardamos */}
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={ambienceVol}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setAmbienceVol(v);
                            if (ambienceElRef.current) ambienceElRef.current.volume = v;
                        }}
                        style={sliderStyle}
                    />

                    <div style={{ marginTop: 8, fontSize: 12, color: MUTED }}>
                        Status: {sessionActive ? (ambiencePlaying ? "Playing" : "Ready") : "Paused"}
                    </div>
                </div>
            </div>
        );
    }

    // audio local
    if (soundMode === "upload") {
        return (
            <div
                style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 16,
                    background: CARD,
                    padding: 12,
                    display: "grid",
                    gap: 12,
                }}
            >
                <div
                    style={{
                        border: `1px dashed ${BORDER}`,
                        borderRadius: 14,
                        background: SOFT,
                        padding: 12,
                    }}
                >
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                            // coger 1r archivo seleccionado
                            const file = e.target.files?.[0];

                            // si no hay archivo --> salir
                            if (!file) return;

                            // si ya había archivo antes --> limpiar URL temporal
                            if (localUrl) URL.revokeObjectURL(localUrl);

                            // crear url local temporal y guardar
                            const url = URL.createObjectURL(file);
                            setLocalUrl(url);

                            setTimeout(() => {
                                if (audioElRef.current) {
                                    // ajustar vol
                                    audioElRef.current.volume = localVol;
                                    audioElRef.current.loop = localLoop;

                                    if (sessionActive) {
                                        audioElRef.current.play();
                                        setLocalPlaying(true); // si sesión activa --> reproduce auto
                                    }
                                }
                            }, 0);
                        }}
                    />
                </div>

                {/* si hay archivo --> reproductor y boton remove; si no --> texto */}
                {localUrl ? (
                    <>
                        <audio
                            ref={audioElRef}
                            src={localUrl}
                            controls
                            loop={localLoop}
                            onPlay={() => setLocalPlaying(true)}
                            onPause={() => setLocalPlaying(false)}
                            style={{ width: "100%" }}
                        />

                        <label
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 13,
                                color: ACCENT,
                                fontWeight: 800,
                            }}
                        >

                            <input
                                type="checkbox"
                                checked={localLoop} // permitir loop
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setLocalLoop(checked);
                                    if (audioElRef.current) audioElRef.current.loop = checked;
                                }}
                            />
                            Loop audio
                        </label>

                        <div style={{ marginTop: 8, fontSize: 12, color: MUTED }}>
                            Status: {localPlaying ? "Playing" : "Paused"}
                        </div>

                        <div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (audioElRef.current) {
                                        audioElRef.current.pause();
                                        audioElRef.current.currentTime = 0;
                                    }

                                    setLocalPlaying(false);

                                    if (localUrl) URL.revokeObjectURL(localUrl);
                                    setLocalUrl("");
                                }}
                                style={subtleBtn}
                            >
                                Remove audio
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ fontSize: 12, color: MUTED }}>
                        No file selected.
                    </div>
                )}
            </div>
        );
    }

    // spotify
    return (
        <div
            style={{
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                background: CARD,
                padding: 12,
                display: "grid",
                gap: 10,
            }}
        >
            <input
                value={spotifyInput}
                onChange={(e) => setSpotifyInput(e.target.value)}
                placeholder="Paste a Spotify track, playlist or album link"
                style={inputStyle}
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                    type="button"
                    onClick={() => {
                        const embed = extractSpotifyEmbedUrl(spotifyInput);
                        if (!embed) {
                            alert("Introduzca un link de Spotify válido.");
                            return;
                        }
                        setSpotifyUrl(embed);
                    }}
                    style={softPrimaryBtn}
                >
                    Save Spotify link
                </button>

                {/* limpiar input y embed */}
                <button
                    type="button"
                    onClick={() => {
                        setSpotifyInput("");
                        setSpotifyUrl("");
                    }}
                    style={subtleBtn}
                >
                    Clear
                </button>
            </div>

            {/* url válida --> iframe */}
            {spotifyUrl ? (
                <div
                    style={{
                        border: `1px solid ${BORDER}`,
                        borderRadius: 14,
                        overflow: "hidden",
                        background: SOFT,
                    }}
                >
                    <iframe
                        src={spotifyUrl}
                        width="100%"
                        height="152"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        loading="lazy"
                        title="Spotify player"
                        style={{ display: "block" }}
                    />
                </div>
            ) : (
                <div style={{ fontSize: 12, color: MUTED }}>
                    No Spotify link saved.
                </div>
            )}
        </div>
    );
}