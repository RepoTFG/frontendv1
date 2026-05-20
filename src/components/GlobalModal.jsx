import { useEffect, useState } from "react";

let externalOpenModal = null; // abrir modal desde cualquier archivo
// para reemplezar alert()
export function showAlert(message) {
    if (externalOpenModal) {
        externalOpenModal({
            type: "alert",
            message,
        });
    }
}
// para reemplazar confirm()
export function showConfirm(message) {
    // promise debido a que confirm devuelve true or false y espera interacción usuario
    return new Promise((resolve) => {
        if (externalOpenModal) {
            externalOpenModal({
                type: "confirm",
                message,
                resolve, // resolve según botón pulsado (false/true)
            });
        }
    });
}

export default function GlobalModal() {
    // guardamos dentro de estado infromación del modal
    const [modal, setModal] = useState({
        open: false, // si modal está visible
        type: "alert", // alert/confirm
        message: "",
        resolve: null, // función promise para confirm
    });

    useEffect(() => {
        externalOpenModal = ({ type, message, resolve = null }) => {
            setModal({
                open: true, // abrir modal
                type,
                message,
                resolve,
            });
        };
    }, []);
    // cerrar modal
    const closeModal = () => {
        setModal((prev) => ({
            ...prev,
            open: false,
        }));
    };

    const handleConfirm = () => {
        modal.resolve?.(true); // cuando pulsa OK
        closeModal();
    };

    const handleCancel = () => {
        modal.resolve?.(false); // cuando pulsa CANCEL
        closeModal();
    };
    // si modal está cerrado no renderizar nada
    if (!modal.open) return null;

    return (
        <div
            style={{
                position: "fixed", // overlay fijo
                inset: 0,
                background: "rgba(47,42,36,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                padding: 20,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 380,
                    background: "#F6F3EF",
                    borderRadius: 24,
                    padding: 24,
                    boxShadow: "0 10px 40px rgba(47,42,36,0.18)",
                    border: "1px solid #E9E4DE",
                }}
            >
                {/* título modal */}
                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 800,
                        marginBottom: 12,
                        color: "#2F2A24",
                    }}
                >
                    ReadRoom
                </div>
                {/* mensaje */}
                <div
                    style={{
                        color: "rgba(47,42,36,0.75)",
                        fontSize: 15,
                        lineHeight: 1.5,
                        marginBottom: 24,
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {modal.message}
                </div>
                {/* botones */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 10,
                    }}
                >
                    {/* botón cancel solo para confirm */}
                    {modal.type === "confirm" && (
                        <button
                            onClick={handleCancel}
                            style={{
                                border: "1px solid #E9E4DE",
                                background: "#FFFFFF",
                                color: "#2F2A24",
                                padding: "10px 16px",
                                borderRadius: 12,
                                cursor: "pointer",
                                fontWeight: 700,
                            }}
                        >
                            Cancel
                        </button>
                    )}
                    {/* botón OK */}
                    <button
                        onClick={
                            modal.type === "confirm"
                                ? handleConfirm
                                : closeModal
                        }
                        style={{
                            border: "none",
                            background: "#2F2A24",
                            color: "white",
                            padding: "10px 16px",
                            borderRadius: 12,
                            cursor: "pointer",
                            fontWeight: 700,
                        }}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}