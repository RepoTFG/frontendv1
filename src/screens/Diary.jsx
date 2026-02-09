import { useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import { api } from "../services/api";

export default function Diary({ books, setSelectedBook, styles }) {
    const { ACCENT, SOFT, CARD, BORDER, MUTED } = styles;

    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState([]);

    const [q, setQ] = useState("");
    const [onlyQuotes, setOnlyQuotes] = useState(false);
    const [bookId, setBookId] = useState("");

    // map para resolver bookId --> info libro
    const bookById = useMemo(() => {
        const m = new Map();
        (Array.isArray(books) ? books : []).forEach((b) => m.set(String(b.id), b));
        return m;
    }, [books]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const token = await auth.currentUser.getIdToken();

            const data = await api.listAllNotes(token, {
                q: q.trim() || undefined,
                onlyQuotes,
                bookId: bookId || undefined,
                limit: 300,
            });

            setNotes(Array.isArray(data) ? data : []);
        } catch (e) {
            alert(e.message || "Error cargando el Diary");
            setNotes([]);
        } finally {
            setLoading(false);
        }
    }, [q, onlyQuotes, bookId]);

    // cargar al entrar
    useEffect(() => {
        load();
    }, [load]);

    // recargar con filtros (debounce simple)
    useEffect(() => {
        const t = setTimeout(() => load(), 250);
        return () => clearTimeout(t);
    }, [load]);

    const card = {
        border: `1px solid ${BORDER}`,
        borderRadius: 18,
        background: CARD,
        padding: 14,
    };

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

    return (
        <>
            {/* filtros */}
            <div style={card}>
                <div style={{ fontWeight: 900, color: ACCENT, marginBottom: 10 }}>
                    Diary
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar en tus notas (texto, capítulo o cita)"
                        style={inputStyle}
                    />

                    <select
                        value={bookId}
                        onChange={(e) => setBookId(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">Todos los libros</option>
                        {(Array.isArray(books) ? books : []).map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.title || "Sin título"}
                            </option>
                        ))}
                    </select>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            onClick={() => setOnlyQuotes((v) => !v)}
                            style={pill(onlyQuotes)}
                            title="Mostrar solo notas con frase destacada"
                        >
                            {onlyQuotes ? "✅ Solo citas" : "Solo citas"}
                        </button>
                    </div>
                </div>
            </div>

            {/* timeline */}
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {loading ? (
                    <div style={{ opacity: 0.7 }}>Cargando notas...</div>
                ) : notes.length === 0 ? (
                    <div style={{ ...card, color: MUTED, fontSize: 13 }}>
                        No hay notas todavía. Abre un libro y escribe tu primera nota en “Diary”.
                    </div>
                ) : (
                    notes.map((n) => {
                        const b = bookById.get(String(n.bookId));
                        const title = b?.title || "Libro";
                        const author = b?.author || "";

                        return (
                            <button
                                key={n.id}
                                type="button"
                                onClick={() => {
                                    if (b) setSelectedBook(b);
                                    else alert("Este libro ya no está en tu biblioteca.");
                                }}
                                style={{
                                    textAlign: "left",
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: 18,
                                    background: CARD,
                                    padding: 14,
                                    cursor: "pointer",
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
                                        {author && (
                                            <div style={{ marginTop: 2, color: MUTED, fontSize: 12 }}>
                                                {author}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ fontSize: 11, color: MUTED, whiteSpace: "nowrap" }}>
                                        {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                                    </div>
                                </div>

                                {n.chapter && (
                                    <div style={{ marginTop: 10, fontSize: 12, color: MUTED, fontWeight: 800 }}>
                                        {n.chapter}
                                    </div>
                                )}

                                <div style={{ marginTop: 8, color: ACCENT, whiteSpace: "pre-wrap" }}>
                                    {n.text}
                                </div>

                                {n.quote && (
                                    <div style={{ marginTop: 8, fontStyle: "italic", color: MUTED }}>
                                        “{n.quote}”
                                    </div>
                                )}

                                <div style={{ marginTop: 10, fontSize: 12, color: MUTED }}>
                                    Toca para abrir el libro
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </>
    );
}
