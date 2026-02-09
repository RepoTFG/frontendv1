import { useEffect, useRef, useState } from "react";

export default function AmbientPlayer({ styles }) {
    const { ACCENT, SOFT, CARD, BORDER, MUTED } = styles;

    // para archivos subidos
    const [localUrl, setLocalUrl] = useState("");
    const audioElRef = useRef(null);
    const [localPlaying, setLocalPlaying] = useState(false);
    const [localVol, setLocalVol] = useState(0.6);

    // limpiamos
    useEffect(() => {
        return () => {
            if (localUrl) URL.revokeObjectURL(localUrl);
        };
    }, [localUrl]);

    const card = {
        border: `1px solid ${BORDER}`,
        borderRadius: 18,
        background: CARD,
        padding: 14,
    };

    return (
        <div style={{ marginTop: 14 }}>
            <div style={{ ...card }}>
                <div style={{ fontWeight: 900, color: ACCENT, marginBottom: 8 }}>
                    Tu audio (archivo local)
                </div>

                <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // liberamos el anterior
                        if (localUrl) URL.revokeObjectURL(localUrl);
                        const url = URL.createObjectURL(file);
                        setLocalUrl(url);
                        // reproducir automáticamente
                        setTimeout(() => {
                            if (audioElRef.current) {
                                audioElRef.current.volume = localVol;
                                audioElRef.current.play();
                                setLocalPlaying(true);
                            }
                        }, 0);
                    }}
                />

                {localUrl ? (
                    <div style={{ marginTop: 10 }}>
                        <audio
                            ref={audioElRef}
                            src={localUrl}
                            controls
                            onPlay={() => setLocalPlaying(true)}
                            onPause={() => setLocalPlaying(false)}
                            style={{ width: "100%" }}
                        />

                        <label
                            style={{
                                display: "block",
                                marginTop: 10,
                                fontSize: 12,
                                color: MUTED,
                                fontWeight: 900,
                            }}
                        >
                            Volumen archivo
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={localVol}
                                onChange={(e) => {
                                    const v = Number(e.target.value);
                                    setLocalVol(v);
                                    if (audioElRef.current) audioElRef.current.volume = v;
                                }}
                                style={{ width: "100%", marginTop: 6 }}
                            />
                        </label>

                        <div style={{ marginTop: 8, fontSize: 12, color: MUTED }}>
                            Estado: {localPlaying ? "Reproduciendo" : "Pausado"}
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                // quitamos el audio actual
                                if (audioElRef.current) {
                                    audioElRef.current.pause();
                                    audioElRef.current.currentTime = 0;
                                }
                                setLocalPlaying(false);

                                if (localUrl) URL.revokeObjectURL(localUrl);
                                setLocalUrl("");
                            }}
                            style={{
                                marginTop: 10,
                                padding: "10px 12px",
                                borderRadius: 14,
                                border: `1px solid ${BORDER}`,
                                background: SOFT,
                                color: ACCENT,
                                fontWeight: 900,
                                cursor: "pointer",
                            }}
                        >
                            Quitar audio
                        </button>
                    </div>
                ) : (
                    <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>
                        Sube un archivo de audio para escucharlo mientras lees.
                    </div>
                )}
            </div>
        </div>
    );
}
