import { useEffect } from "react";
import ReactDOM from "react-dom";
import "../../styles/features/modal.css";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

const Modal = ({ children, onClose }: ModalProps) => {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.classList.add("modal-open");

    // Limpiar cuando el modal se cierre
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar modal">
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
