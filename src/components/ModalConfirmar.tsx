"use client";

import Modal from "./Modal";

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  peligroso?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalConfirmar({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Sí, eliminar",
  peligroso = true,
  onConfirmar,
  onCancelar,
}: Props) {
  return (
    <Modal abierto={abierto} titulo={titulo} onCerrar={onCancelar}>
      <p className="mb-6 text-lg text-suave">{mensaje}</p>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="boton-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className={peligroso ? "boton-peligro" : "boton-primario"} onClick={onConfirmar}>
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
