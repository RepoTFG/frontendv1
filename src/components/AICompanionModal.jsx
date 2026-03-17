import { useMemo, useState } from "react";

export default function AICompanionModal({
                                             notes,
                                             books,
                                             styles,
                                             onClose,
                                             getAnswersForNote,
                                             reflectNote,
                                             aiLoadingId,
                                             saveCompanionAnswers,
                                             savingAnswersId,
                                             updateDraftAnswer,
                                             moodLabel,
                                         }) {
    const { ACCENT, SOFT, CARD, BORDER, MUTED } = styles;
    // tab: pendiente o completado
    const [tab, setTab] = useState("pending");
    // ver qué nota está abierta
    const [openId, setOpenId] = useState(null);

    const subtleBtn = {
        padding: "8px 10px",
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        background: "white",
        color: ACCENT,
        cursor: "pointer",
        fontWeight: 800,
        fontSize: 12,
    };

    const pill = (active) => ({
        padding: "8px 10px",
        borderRadius: 999,
        border: `1px solid ${active ? ACCENT : BORDER}`,
        background: active ? SOFT : CARD,
        color: ACCENT,
        fontWeight: active ? 900 : 800,
        cursor: "pointer",
        fontSize: 12,
    });
    // localizamos libro por su id
    const bookById = useMemo(() => {
        const m = new Map();
        (Array.isArray(books) ? books : []).forEach((b) => m.set(String(b.id), b));
        return m;
    }, [books]);
    // ordenar notas: de más recientes a más antiguas
    const candidateNotes = useMemo(() => {
        return (Array.isArray(notes) ? notes : []).sort(
            (a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0)
        );
    }, [notes]);
    // pendientes: menos de 3 preguntas contestadas
    const pending = useMemo(() => {
        return candidateNotes.filter((n) => {
            const answered = getAnswersForNote(n).filter((x) => String(x || "").trim()).length;
            return answered < 3;
        });
    }, [candidateNotes, getAnswersForNote]);
    // completadas
    const completed = useMemo(() => {
        return candidateNotes.filter((n) => {
            const answered = getAnswersForNote(n).filter((x) => String(x || "").trim()).length;
            return answered >= 3;
        });
    }, [candidateNotes, getAnswersForNote]);
    // según la pestaña esté abierta: completado o pendiente
    const visible = tab === "completed" ? completed : pending;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                padding: 16,
                zIndex: 90,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "100%",
                    maxWidth: 520,
                    maxHeight: "88vh",
                    overflow: "auto",
                    borderRadius: 24,
                    border: `1px solid ${BORDER}`,
                    background: CARD,
                    padding: 14,
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                    <div style={{ fontWeight: 900, color: ACCENT, fontSize: 20 }}>AI companion</div>
                    <button type="button" onClick={onClose} style={subtleBtn}>
                        Close
                    </button>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => setTab("completed")} style={pill(tab === "completed")}>
                        Completed
                    </button>
                    <button type="button" onClick={() => setTab("pending")} style={pill(tab === "pending")}>
                        Pending
                    </button>
                </div>

                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                    {visible.length === 0 ? (
                        <div style={{ color: MUTED, fontSize: 13 }}>
                            No reflections in this section yet.
                        </div>
                    ) : (
                        visible.map((n) => {
                            const b = bookById.get(String(n.bookId));
                            const title = b?.title || n.bookTitle || "Libro";
                            const author = b?.author || n.bookAuthor || "";
                            // obtenemos respuestas actuales o bien ya guardadas o borrador
                            const answers = getAnswersForNote(n);
                            // contamos respuestas
                            const answered = answers.filter((x) => String(x || "").trim()).length;
                            // ver si la nota ya tiene preguntas creadas por IA
                            const hasCompanion = Array.isArray(n.aiCompanion?.questions) && n.aiCompanion.questions.length > 0;
                            const isOpen = openId === n.id;

                            return (
                                <div
                                    key={n.id}
                                    style={{
                                        border: `1px solid ${BORDER}`,
                                        borderRadius: 20,
                                        background: SOFT,
                                        padding: 14,
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontWeight: 900,
                                                    color: ACCENT,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {title}
                                            </div>
                                            <div style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>
                                                {[author, n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""].filter(Boolean).join(" · ")}
                                            </div>
                                        </div>
                                        {/* contador de respuestas contestadas */}

                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: ACCENT,
                                                fontWeight: 900,
                                                border: `1px solid ${BORDER}`,
                                                borderRadius: 999,
                                                padding: "6px 8px",
                                                background: CARD,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {answered}/3
                                        </div>
                                    </div>
                                    {/* si la nota tiene mood: mostrar */}

                                    {typeof n.mood === "string" && n.mood.trim() && (
                                        <div style={{ marginTop: 10, fontSize: 12, color: MUTED, fontWeight: 800 }}>
                                            Mood · <span style={{ color: ACCENT }}>{moodLabel(n.mood)}</span>
                                        </div>
                                    )}
                                    {/* preview o texto nota */}
                                    <div
                                        style={{
                                            marginTop: 10,
                                            color: ACCENT,
                                            fontSize: 14,
                                            lineHeight: 1.55,
                                            whiteSpace: "pre-wrap",
                                            display: isOpen ? "block" : "-webkit-box",
                                            WebkitLineClamp: isOpen ? "unset" : 4,
                                            WebkitBoxOrient: isOpen ? "unset" : "vertical",
                                            overflow: isOpen ? "visible" : "hidden",
                                        }}
                                    >
                                        {n.text || "Open this note to reflect on it."}
                                    </div>
                                    {/* abrir/cerrar */}
                                    <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenId((prev) => prev === n.id ? null : n.id)}
                                            style={subtleBtn}
                                        >
                                            {isOpen ? "Close" : "Open"}
                                        </button>
                                        {/* si no hay reflexión IA --> botón para generar */}
                                        {!hasCompanion ? (
                                            <button
                                                type="button"
                                                onClick={() => reflectNote(n)}
                                                style={{
                                                    padding: "10px 12px",
                                                    borderRadius: 12,
                                                    border: `1px solid ${ACCENT}`,
                                                    background: ACCENT,
                                                    color: "white",
                                                    cursor: "pointer",
                                                    fontWeight: 800,
                                                }}
                                                disabled={aiLoadingId === n.id}
                                            >
                                                {aiLoadingId === n.id ? "Thinking..." : "Generate reflection"}
                                            </button>
                                        ) : null}
                                    </div>
                                    {/* si tarjeta está abierta y hay preguntas--> mostrar formulario */}
                                    {isOpen && hasCompanion && (
                                        <>
                                            {/* intro opcional creada por IA */}
                                            {n.aiCompanion?.intro ? (
                                                <div style={{ marginTop: 12, color: MUTED, fontSize: 13, lineHeight: 1.45 }}>
                                                    {n.aiCompanion.intro}
                                                </div>
                                            ) : null}
                                            {/* preguntas y respuestas */}
                                            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                                                {(n.aiCompanion?.questions || []).map((question, idx) => (
                                                    <div key={idx} style={{ display: "grid", gap: 6 }}>
                                                        <div style={{ color: ACCENT, fontSize: 14, lineHeight: 1.45, fontWeight: 800 }}>
                                                            {idx + 1}. {question}
                                                        </div>
                                                        {/* respuesta del usuario */}
                                                        <textarea
                                                            value={answers[idx] || ""}
                                                            onChange={(e) => updateDraftAnswer(n.id, idx, e.target.value, n)}
                                                            placeholder="Write your reflection..."
                                                            rows={3}
                                                            style={{
                                                                padding: 12,
                                                                borderRadius: 14,
                                                                border: `1px solid ${BORDER}`,
                                                                background: CARD,
                                                                outline: "none",
                                                                width: "100%",
                                                                boxSizing: "border-box",
                                                                fontSize: 14,
                                                                resize: "vertical",
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            {/* guardar reflexiones */}
                                            <div style={{ marginTop: 12 }}>
                                                <button
                                                    type="button"
                                                    onClick={() => saveCompanionAnswers(n.id, n)}
                                                    style={{
                                                        padding: "10px 12px",
                                                        borderRadius: 12,
                                                        border: `1px solid ${ACCENT}`,
                                                        background: ACCENT,
                                                        color: "white",
                                                        cursor: "pointer",
                                                        fontWeight: 800,
                                                    }}
                                                    disabled={savingAnswersId === n.id}
                                                >
                                                    {savingAnswersId === n.id ? "Saving..." : "Save reflections"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}