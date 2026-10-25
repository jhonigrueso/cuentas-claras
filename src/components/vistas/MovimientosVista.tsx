"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDatos } from "@/context/DatosContext";
import { useToast } from "@/context/ToastContext";
import { delMes, ordenarRecientes } from "@/lib/calculos";
import { buscarCategoria } from "@/lib/categorias";
import { fechaCorta, pesos } from "@/lib/formato";
import type { Movimiento } from "@/lib/tipos";
import Cargando from "../Cargando";
import FormularioMovimiento from "../FormularioMovimiento";
import { IconoBasura, IconoLapiz } from "../Iconos";
import Modal from "../Modal";
import ModalConfirmar from "../ModalConfirmar";
import SelectorMes from "../SelectorMes";

type Filtro = "todos" | "ingreso" | "gasto";

const FILTROS: { valor: Filtro; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "ingreso", texto: "Ingresos" },
  { valor: "gasto", texto: "Gastos" },
];

export default function MovimientosVista() {
  const { datos, cargado, mes, despachar } = useDatos();
  const toast = useToast();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [editando, setEditando] = useState<Movimiento | null>(null);
  const [eliminando, setEliminando] = useState<Movimiento | null>(null);

  const lista = useMemo(() => {
    const delMesActual = ordenarRecientes(delMes(datos.movimientos, mes));
    return filtro === "todos" ? delMesActual : delMesActual.filter((m) => m.tipo === filtro);
  }, [datos.movimientos, mes, filtro]);

  const total = lista.reduce((suma, m) => suma + (m.tipo === "ingreso" ? m.valor : -m.valor), 0);

  if (!cargado) return <Cargando />;

  function guardarEdicion(movimiento: Movimiento) {
    despachar({ tipo: "editarMovimiento", movimiento });
    setEditando(null);
    toast("Cambios guardados");
  }

  function confirmarEliminar() {
    if (!eliminando) return;
    despachar({ tipo: "eliminarMovimiento", id: eliminando.id });
    setEliminando(null);
    toast("Registro eliminado", "info");
  }

  const nombreDeuda = (id?: string) => datos.deudas.find((d) => d.id === id)?.nombre;

  return (
    <div className="space-y-4">
      <SelectorMes />

      <div role="tablist" aria-label="Filtrar movimientos" className="grid grid-cols-3 gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            role="tab"
            aria-selected={filtro === f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`min-h-12 rounded-xl text-base font-bold transition ${
              filtro === f.valor ? "bg-marca text-white" : "text-suave hover:bg-stone-50"
            }`}
          >
            {f.texto}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="tarjeta text-center">
          <p className="text-5xl" aria-hidden>
            🗒️
          </p>
          <p className="mt-2 text-lg font-bold">No hay registros {filtro === "todos" ? "" : `de ${filtro}s `}en este mes</p>
          <Link href="/registrar" className="boton-primario mt-4">
            Registrar
          </Link>
        </div>
      ) : (
        <>
          <p className="px-1 text-base text-suave">
            {lista.length} {lista.length === 1 ? "registro" : "registros"} ·{" "}
            <span className={`font-bold ${total >= 0 ? "text-ingreso" : "text-gasto"}`}>
              {filtro === "todos" ? "Saldo" : "Total"}: {pesos(filtro === "gasto" ? -total : total)}
            </span>
          </p>
          <ul className="space-y-2">
            {lista.map((m) => {
              const categoria = buscarCategoria(m.tipo, m.categoria);
              const esIngreso = m.tipo === "ingreso";
              const deuda = nombreDeuda(m.deudaId);
              return (
                <li key={m.id} className="tarjeta flex items-center gap-3 p-3 sm:p-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `${categoria.color}1f` }}
                    aria-hidden
                  >
                    {categoria.icono}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{m.categoria}</p>
                    <p className="truncate text-sm text-suave">
                      {fechaCorta(m.fecha)}
                      {m.descripcion ? ` · ${m.descripcion}` : ""}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {m.tipo === "gasto" && (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold text-suave">
                          {m.naturaleza === "fijo" ? "Fijo" : "Variable"}
                        </span>
                      )}
                      {m.hormiga && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">🐜 Hormiga</span>
                      )}
                      {deuda && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800">
                          Abono · {deuda}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className={`text-lg font-extrabold tabular-nums ${esIngreso ? "text-ingreso" : "text-gasto"}`}>
                      {esIngreso ? "+" : "-"}
                      {pesos(m.valor)}
                    </p>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditando(m)}
                        className="rounded-xl p-2 text-suave hover:bg-stone-100"
                        aria-label={`Editar ${m.categoria} de ${pesos(m.valor)}`}
                      >
                        <IconoLapiz width={20} height={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEliminando(m)}
                        className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                        aria-label={`Eliminar ${m.categoria} de ${pesos(m.valor)}`}
                      >
                        <IconoBasura width={20} height={20} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <Modal abierto={editando !== null} titulo="Editar registro" onCerrar={() => setEditando(null)}>
        {editando && (
          <FormularioMovimiento
            key={editando.id}
            inicial={editando}
            textoBoton="Guardar cambios"
            onGuardar={guardarEdicion}
            onCancelar={() => setEditando(null)}
          />
        )}
      </Modal>

      <ModalConfirmar
        abierto={eliminando !== null}
        titulo="¿Eliminar este registro?"
        mensaje={
          eliminando
            ? `${eliminando.categoria} por ${pesos(eliminando.valor)} del ${fechaCorta(eliminando.fecha)}.${
                eliminando.deudaId ? " Como es un abono, el saldo de la deuda volverá a subir." : ""
              }`
            : ""
        }
        onConfirmar={confirmarEliminar}
        onCancelar={() => setEliminando(null)}
      />
    </div>
  );
}
