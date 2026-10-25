"use client";

import { useState, type FormEvent } from "react";
import { useDatos } from "@/context/DatosContext";
import { useToast } from "@/context/ToastContext";
import { ahorradoEnMeta, metaSugeridaFondo, objetivoDeMeta, porcentaje, promedioGastosFijos } from "@/lib/calculos";
import { fechaCorta, hoyISO, nuevoId, pesos } from "@/lib/formato";
import { ID_FONDO_EMERGENCIA, type Aporte } from "@/lib/tipos";
import BarraProgreso from "../BarraProgreso";
import CampoValor from "../CampoValor";
import Cargando from "../Cargando";
import { IconoBasura, IconoMas } from "../Iconos";
import Modal from "../Modal";
import ModalConfirmar from "../ModalConfirmar";

export default function MetasVista() {
  const { datos, cargado, despachar } = useDatos();
  const toast = useToast();
  const [agregando, setAgregando] = useState(false);
  const [cambiandoMeta, setCambiandoMeta] = useState(false);
  const [eliminando, setEliminando] = useState<Aporte | null>(null);

  if (!cargado) return <Cargando />;

  const fondo = datos.metas.find((m) => m.id === ID_FONDO_EMERGENCIA);
  const promedioFijos = promedioGastosFijos(datos.movimientos);
  const sugerida = metaSugeridaFondo(datos.movimientos);
  const objetivo = objetivoDeMeta(fondo, datos.movimientos);
  const ahorrado = ahorradoEnMeta(fondo);
  const pct = porcentaje(ahorrado, objetivo);
  const esManual = Boolean(fondo?.objetivoManual);
  const falta = Math.max(0, objetivo - ahorrado);
  const aportes = [...(fondo?.aportes ?? [])].sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div className="space-y-4">
      <section className="tarjeta">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-3xl" aria-hidden>
            🛟
          </span>
          <div>
            <h2 className="text-xl font-extrabold">Fondo de emergencia</h2>
            <p className="text-sm text-suave">Plata guardada solo para imprevistos</p>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-suave">Llevas ahorrado</p>
            <p className="text-3xl font-extrabold text-ingreso tabular-nums">{pesos(ahorrado)}</p>
          </div>
          <p className="text-4xl font-extrabold text-marca tabular-nums">{objetivo > 0 ? `${pct} %` : ""}</p>
        </div>

        <div className="mt-3">
          <BarraProgreso porcentaje={pct} etiqueta="Avance del fondo de emergencia" />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-base">
          {objetivo > 0 ? (
            <p>
              Meta: <b>{pesos(objetivo)}</b>
              {falta > 0 ? (
                <span className="text-suave"> · Te faltan {pesos(falta)}</span>
              ) : (
                <span className="font-bold text-ingreso"> · ¡Meta cumplida! 🎉</span>
              )}
            </p>
          ) : (
            <p className="text-suave">Aún no hay una meta definida.</p>
          )}
          <button type="button" className="font-bold text-marca underline" onClick={() => setCambiandoMeta(true)}>
            Cambiar meta
          </button>
        </div>

        <button type="button" className="boton-primario mt-5 w-full" onClick={() => setAgregando(true)}>
          <IconoMas /> Agregar ahorro
        </button>
      </section>

      <section className="tarjeta bg-sky-50/60">
        <h2 className="text-lg font-extrabold">¿Cuánto debería tener?</h2>
        {promedioFijos > 0 ? (
          <p className="mt-1 text-base">
            Tus gastos fijos son de unos <b>{pesos(promedioFijos)}</b> al mes. Lo recomendado es guardar{" "}
            <b>3 meses</b> de esos gastos: <b>{pesos(sugerida)}</b>.
            {esManual && " Ahora estás usando una meta escrita por ti."}
          </p>
        ) : (
          <p className="mt-1 text-base">
            Lo recomendado es guardar <b>3 meses de gastos fijos</b> (arriendo, servicios, cuotas…). Registra tus gastos
            fijos y aquí te calcularemos la meta.
          </p>
        )}
        <p className="mt-2 text-sm text-suave">
          Consejo: guarda este fondo en un lugar aparte (una cuenta de ahorros o un bolsillo digital) para no gastarlo
          sin querer.
        </p>
      </section>

      {aportes.length > 0 && (
        <section className="tarjeta">
          <h2 className="mb-2 text-lg font-extrabold">Tus ahorros</h2>
          <ul className="divide-y divide-stone-100">
            {aportes.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="text-suave">{fechaCorta(a.fecha)}</span>
                <span className="flex items-center gap-2">
                  <b className="text-ingreso tabular-nums">+{pesos(a.valor)}</b>
                  <button
                    type="button"
                    onClick={() => setEliminando(a)}
                    className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                    aria-label={`Eliminar ahorro de ${pesos(a.valor)}`}
                  >
                    <IconoBasura width={18} height={18} />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Modal abierto={agregando} titulo="Agregar ahorro" onCerrar={() => setAgregando(false)}>
        <FormularioAhorro
          onGuardar={(aporte) => {
            despachar({ tipo: "agregarAporte", metaId: ID_FONDO_EMERGENCIA, aporte });
            setAgregando(false);
            const total = ahorrado + aporte.valor;
            toast(objetivo > 0 && total >= objetivo && ahorrado < objetivo ? "¡Cumpliste tu meta! 🎉" : `Ahorro de ${pesos(aporte.valor)} guardado`);
          }}
          onCancelar={() => setAgregando(false)}
        />
      </Modal>

      <Modal abierto={cambiandoMeta} titulo="Cambiar meta" onCerrar={() => setCambiandoMeta(false)}>
        <FormularioMeta
          actual={fondo?.objetivoManual ?? sugerida}
          sugerida={sugerida}
          esManual={esManual}
          onGuardar={(nueva) => {
            despachar({ tipo: "definirObjetivo", metaId: ID_FONDO_EMERGENCIA, objetivo: nueva });
            setCambiandoMeta(false);
            toast(nueva === null ? "Usando la meta sugerida" : "Meta actualizada");
          }}
          onCancelar={() => setCambiandoMeta(false)}
        />
      </Modal>

      <ModalConfirmar
        abierto={eliminando !== null}
        titulo="¿Eliminar este ahorro?"
        mensaje={eliminando ? `Ahorro de ${pesos(eliminando.valor)} del ${fechaCorta(eliminando.fecha)}.` : ""}
        onConfirmar={() => {
          if (eliminando) despachar({ tipo: "eliminarAporte", metaId: ID_FONDO_EMERGENCIA, aporteId: eliminando.id });
          setEliminando(null);
          toast("Ahorro eliminado", "info");
        }}
        onCancelar={() => setEliminando(null)}
      />
    </div>
  );
}

function FormularioAhorro({ onGuardar, onCancelar }: { onGuardar: (a: Aporte) => void; onCancelar: () => void }) {
  const [valor, setValor] = useState(0);
  const [fecha, setFecha] = useState(hoyISO());
  const [error, setError] = useState("");

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!(valor > 0)) return setError("Escribe un valor mayor que cero.");
    onGuardar({ id: nuevoId(), valor, fecha: fecha || hoyISO() });
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <CampoValor
        etiqueta="¿Cuánto guardaste?"
        valor={valor}
        onCambio={(v) => {
          setValor(v);
          setError("");
        }}
        error={error}
        grande
      />
      <div className="flex flex-wrap gap-2">
        {[5000, 10000, 20000, 50000].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setValor(v);
              setError("");
            }}
            className="rounded-full border-2 border-stone-200 px-3 py-1.5 font-bold hover:bg-stone-50"
          >
            {pesos(v)}
          </button>
        ))}
      </div>
      <div>
        <label htmlFor="fecha-ahorro" className="etiqueta">
          Fecha
        </label>
        <input id="fecha-ahorro" type="date" className="campo" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button type="button" className="boton-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton-primario">
          Guardar
        </button>
      </div>
    </form>
  );
}

function FormularioMeta({
  actual,
  sugerida,
  esManual,
  onGuardar,
  onCancelar,
}: {
  actual: number;
  sugerida: number;
  esManual: boolean;
  onGuardar: (meta: number | null) => void;
  onCancelar: () => void;
}) {
  const [valor, setValor] = useState(actual);
  const [error, setError] = useState("");

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!(valor > 0)) return setError("La meta debe ser mayor que cero.");
    onGuardar(valor);
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <CampoValor
        etiqueta="Mi meta de ahorro"
        valor={valor}
        onCambio={(v) => {
          setValor(v);
          setError("");
        }}
        error={error}
        ayuda={sugerida > 0 ? `Meta sugerida: ${pesos(sugerida)} (3 meses de gastos fijos).` : undefined}
        grande
      />
      {esManual && sugerida > 0 && (
        <button type="button" className="font-bold text-marca underline" onClick={() => onGuardar(null)}>
          Volver a la meta sugerida
        </button>
      )}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button type="button" className="boton-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton-primario">
          Guardar
        </button>
      </div>
    </form>
  );
}
