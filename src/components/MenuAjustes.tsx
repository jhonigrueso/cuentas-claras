"use client";

import { useState } from "react";
import { useDatos } from "@/context/DatosContext";
import { useToast } from "@/context/ToastContext";
import { datosVacios } from "@/lib/almacenamiento";
import { descargarCSV } from "@/lib/csv";
import { crearDatosEjemplo } from "@/lib/datosEjemplo";
import FormularioNombre from "./FormularioNombre";
import { IconoBasura, IconoCaja, IconoDescargar, IconoEngranaje, IconoLapiz } from "./Iconos";
import Modal from "./Modal";
import ModalConfirmar from "./ModalConfirmar";

type Confirmacion = null | "ejemplo" | "borrar" | "nombre";

export default function MenuAjustes() {
  const { datos, despachar } = useDatos();
  const toast = useToast();
  const [abierto, setAbierto] = useState(false);
  const [confirmar, setConfirmar] = useState<Confirmacion>(null);

  const hayDatos = datos.movimientos.length > 0 || datos.deudas.length > 0 || datos.metas.some((m) => m.aportes.length);

  function pedir(accion: Exclude<Confirmacion, null>) {
    setAbierto(false);
    setConfirmar(accion);
  }

  function cargarEjemplo() {
    // Se conserva el nombre de la persona
    despachar({ tipo: "cargar", datos: { ...crearDatosEjemplo(), perfil: datos.perfil } });
    setAbierto(false);
    setConfirmar(null);
    toast("Datos de ejemplo cargados");
  }

  function borrarTodo() {
    despachar({ tipo: "cargar", datos: datosVacios() });
    setConfirmar(null);
    toast("Se borraron todos los datos", "info");
  }

  function descargar() {
    setAbierto(false);
    if (!hayDatos) {
      toast("Todavía no hay datos para descargar", "info");
      return;
    }
    if (descargarCSV(datos)) toast("Archivo descargado");
    else toast("No se pudo descargar el archivo", "error");
  }

  const opciones = [
    {
      texto: "Cambiar mi nombre",
      detalle: `Ahora: ${datos.perfil.nombre || "sin nombre"}`,
      Icono: IconoLapiz,
      color: "bg-amber-100 text-amber-700",
      accion: () => pedir("nombre"),
    },
    {
      texto: "Cargar datos de ejemplo",
      detalle: "Para la demostración del taller",
      Icono: IconoCaja,
      color: "bg-sky-100 text-sky-700",
      accion: () => (hayDatos ? pedir("ejemplo") : cargarEjemplo()),
    },
    {
      texto: "Descargar mis datos",
      detalle: "Archivo CSV para abrir en Excel",
      Icono: IconoDescargar,
      color: "bg-marca-claro text-marca",
      accion: descargar,
    },
    {
      texto: "Borrar todos los datos",
      detalle: "No se puede deshacer",
      Icono: IconoBasura,
      color: "bg-rose-100 text-rose-700",
      accion: () => pedir("borrar"),
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="rounded-full p-2.5 text-white/90 hover:bg-white/15"
        aria-label="Ajustes"
      >
        <IconoEngranaje />
      </button>

      <Modal abierto={abierto} titulo="Ajustes" onCerrar={() => setAbierto(false)}>
        <ul className="space-y-2">
          {opciones.map(({ texto, detalle, Icono, color, accion }) => (
            <li key={texto}>
              <button
                type="button"
                onClick={accion}
                className="flex w-full items-center gap-4 rounded-2xl border-2 border-stone-100 p-4 text-left hover:bg-stone-50"
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}>
                  <Icono />
                </span>
                <span>
                  <span className="block text-lg font-bold">{texto}</span>
                  <span className="block text-sm text-suave">{detalle}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      <ModalConfirmar
        abierto={confirmar === "ejemplo"}
        titulo="¿Cargar datos de ejemplo?"
        mensaje="Los datos de ejemplo reemplazarán todo lo que tienes guardado ahora. Si quieres conservarlo, primero descarga tus datos."
        textoConfirmar="Sí, cargar"
        peligroso={false}
        onConfirmar={cargarEjemplo}
        onCancelar={() => setConfirmar(null)}
      />
      <ModalConfirmar
        abierto={confirmar === "borrar"}
        titulo="¿Borrar todos los datos?"
        mensaje="Se eliminarán tu nombre, tus movimientos, deudas y ahorros de este celular. Esto no se puede deshacer."
        textoConfirmar="Sí, borrar todo"
        onConfirmar={borrarTodo}
        onCancelar={() => setConfirmar(null)}
      />
      <Modal abierto={confirmar === "nombre"} titulo="Cambiar mi nombre" onCerrar={() => setConfirmar(null)}>
        <FormularioNombre
          inicial={datos.perfil.nombre}
          textoBoton="Guardar"
          onGuardar={(nombre) => {
            despachar({ tipo: "definirNombre", nombre });
            setConfirmar(null);
            toast(`Listo, ahora te llamamos ${nombre}`);
          }}
          onCancelar={() => setConfirmar(null)}
        />
      </Modal>
    </>
  );
}
