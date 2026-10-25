"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useDatos } from "@/context/DatosContext";
import { useToast } from "@/context/ToastContext";
import { ordenarDeudas, pagadoDeDeuda, porcentaje, saldoDeDeuda, type MetodoDeuda } from "@/lib/calculos";
import { CATEGORIA_DEUDAS } from "@/lib/categorias";
import { hoyISO, nuevoId, pesos } from "@/lib/formato";
import type { Deuda } from "@/lib/tipos";
import BarraProgreso from "../BarraProgreso";
import CampoValor from "../CampoValor";
import Cargando from "../Cargando";
import { IconoBasura, IconoMas } from "../Iconos";
import Modal from "../Modal";
import ModalConfirmar from "../ModalConfirmar";

const METODOS: { valor: MetodoDeuda; titulo: string; icono: string; explicacion: string }[] = [
  {
    valor: "bola",
    titulo: "Bola de nieve",
    icono: "⛄",
    explicacion:
      "Paga primero la deuda más pequeña, y a las demás solo la cuota mínima. Cuando la termines, suma esa cuota a la siguiente. Ver deudas cerradas te da ánimo para seguir.",
  },
  {
    valor: "avalancha",
    titulo: "Avalancha",
    icono: "🏔️",
    explicacion:
      "Paga primero la deuda con el interés más alto, y a las demás solo la cuota mínima. Así pagas menos intereses en total y ahorras más plata.",
  },
];

type DeudaConSaldo = Deuda & { saldo: number; pagado: number };

export default function DeudasVista() {
  const { datos, cargado, despachar } = useDatos();
  const toast = useToast();
  const [metodo, setMetodo] = useState<MetodoDeuda>("bola");
  const [agregando, setAgregando] = useState(false);
  const [abonando, setAbonando] = useState<DeudaConSaldo | null>(null);
  const [eliminando, setEliminando] = useState<DeudaConSaldo | null>(null);

  const deudas = useMemo<DeudaConSaldo[]>(
    () =>
      ordenarDeudas(
        datos.deudas.map((d) => ({
          ...d,
          saldo: saldoDeDeuda(d, datos.movimientos),
          pagado: pagadoDeDeuda(d, datos.movimientos),
        })),
        metodo,
      ),
    [datos.deudas, datos.movimientos, metodo],
  );

  if (!cargado) return <Cargando />;

  const pendientes = deudas.filter((d) => d.saldo > 0);
  const totalDeuda = pendientes.reduce((s, d) => s + d.saldo, 0);
  const totalCuotas = pendientes.reduce((s, d) => s + d.cuota, 0);
  const metodoActual = METODOS.find((m) => m.valor === metodo)!;

  return (
    <div className="space-y-4">
      {/* Totales */}
      <section className="grid grid-cols-2 gap-3" aria-label="Totales de deudas">
        <div className="tarjeta">
          <p className="text-sm font-bold text-suave">Total que debo</p>
          <p className="mt-1 text-xl font-extrabold break-all text-gasto tabular-nums sm:text-2xl">{pesos(totalDeuda)}</p>
        </div>
        <div className="tarjeta">
          <p className="text-sm font-bold text-suave">Cuotas al mes</p>
          <p className="mt-1 text-xl font-extrabold break-all tabular-nums sm:text-2xl">{pesos(totalCuotas)}</p>
        </div>
      </section>

      <button type="button" className="boton-primario w-full" onClick={() => setAgregando(true)}>
        <IconoMas /> Agregar deuda
      </button>

      {/* Métodos */}
      <section className="tarjeta" aria-label="Método para pagar deudas">
        <h2 className="text-lg font-extrabold">¿Cuál deuda pago primero?</h2>
        <div role="radiogroup" className="mt-3 grid grid-cols-2 gap-2">
          {METODOS.map((m) => (
            <button
              key={m.valor}
              type="button"
              role="radio"
              aria-checked={metodo === m.valor}
              onClick={() => setMetodo(m.valor)}
              className={`rounded-2xl border-2 px-3 py-3 text-center transition ${
                metodo === m.valor ? "border-marca bg-marca-claro" : "border-stone-200 bg-white hover:bg-stone-50"
              }`}
            >
              <span className="block text-2xl" aria-hidden>
                {m.icono}
              </span>
              <span className="block text-base font-extrabold">{m.titulo}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-base">{metodoActual.explicacion}</p>
        {metodo === "avalancha" && deudas.some((d) => d.saldo > 0 && d.tasa === undefined) && (
          <p className="mt-2 text-sm text-suave">Las deudas sin tasa de interés quedan al final de la lista.</p>
        )}
      </section>

      {/* Lista */}
      {deudas.length === 0 ? (
        <div className="tarjeta text-center">
          <p className="text-5xl" aria-hidden>
            🎉
          </p>
          <p className="mt-2 text-lg font-bold">No tienes deudas registradas</p>
          <p className="text-suave">Si tienes alguna, agrégala para hacerle seguimiento.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {deudas.map((d, i) => {
            const pct = porcentaje(d.pagado, d.saldoInicial);
            const pagada = d.saldo === 0;
            return (
              <li key={d.id} className={`tarjeta ${pagada ? "opacity-75" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {i === 0 && !pagada && (
                      <span className="mb-1 inline-block rounded-full bg-marca px-2.5 py-0.5 text-xs font-extrabold text-white">
                        👉 Paga primero esta
                      </span>
                    )}
                    <h3 className="text-lg font-extrabold break-words">{d.nombre}</h3>
                    <p className="text-sm text-suave">
                      Cuota {pesos(d.cuota)}
                      {d.tasa !== undefined && ` · Interés ${String(d.tasa).replace(".", ",")} % mensual`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEliminando(d)}
                    className="rounded-xl p-2 text-rose-600 hover:bg-rose-50"
                    aria-label={`Eliminar ${d.nombre}`}
                  >
                    <IconoBasura width={20} height={20} />
                  </button>
                </div>

                <div className="mt-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-suave">{pagada ? "¡Deuda pagada!" : "Saldo pendiente"}</p>
                    <p className={`text-2xl font-extrabold tabular-nums ${pagada ? "text-ingreso" : "text-gasto"}`}>
                      {pagada ? "🎉 $0" : pesos(d.saldo)}
                    </p>
                  </div>
                  <p className="text-right text-sm text-suave">
                    Pagado {pesos(d.pagado)}
                    <br />
                    de {pesos(d.saldoInicial)}
                  </p>
                </div>
                <div className="mt-2">
                  <BarraProgreso porcentaje={pct} etiqueta={`Pagado de ${d.nombre}`} />
                  <p className="mt-1 text-sm font-bold text-marca">{pct} % pagado</p>
                </div>

                {!pagada && (
                  <button type="button" className="boton-secundario mt-3 w-full" onClick={() => setAbonando(d)}>
                    💵 Registrar abono
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Modal abierto={agregando} titulo="Agregar deuda" onCerrar={() => setAgregando(false)}>
        <FormularioDeuda
          onGuardar={(deuda) => {
            despachar({ tipo: "agregarDeuda", deuda });
            setAgregando(false);
            toast(`Deuda "${deuda.nombre}" agregada`);
          }}
          onCancelar={() => setAgregando(false)}
        />
      </Modal>

      <Modal abierto={abonando !== null} titulo={`Abono a ${abonando?.nombre ?? ""}`} onCerrar={() => setAbonando(null)}>
        {abonando && (
          <FormularioAbono
            key={abonando.id}
            deuda={abonando}
            onGuardar={(valor, fecha) => {
              despachar({
                tipo: "agregarMovimiento",
                movimiento: {
                  id: nuevoId(),
                  tipo: "gasto",
                  valor,
                  categoria: CATEGORIA_DEUDAS,
                  fecha,
                  descripcion: `Abono a ${abonando.nombre}`,
                  naturaleza: "fijo",
                  hormiga: false,
                  deudaId: abonando.id,
                  creadoEn: Date.now(),
                },
              });
              toast(
                valor >= abonando.saldo ? `¡Felicitaciones! Terminaste de pagar ${abonando.nombre}` : `Abono de ${pesos(valor)} registrado`,
              );
              setAbonando(null);
            }}
            onCancelar={() => setAbonando(null)}
          />
        )}
      </Modal>

      <ModalConfirmar
        abierto={eliminando !== null}
        titulo="¿Eliminar esta deuda?"
        mensaje={`Se eliminará "${eliminando?.nombre ?? ""}" de la lista. Los abonos que ya registraste se quedan como gastos en tus movimientos.`}
        onConfirmar={() => {
          if (eliminando) despachar({ tipo: "eliminarDeuda", id: eliminando.id });
          setEliminando(null);
          toast("Deuda eliminada", "info");
        }}
        onCancelar={() => setEliminando(null)}
      />
    </div>
  );
}

function FormularioDeuda({ onGuardar, onCancelar }: { onGuardar: (d: Deuda) => void; onCancelar: () => void }) {
  const [nombre, setNombre] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [cuota, setCuota] = useState(0);
  const [tasa, setTasa] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  function enviar(e: FormEvent) {
    e.preventDefault();
    const tasaNumero = tasa.trim() ? Number(tasa.replace(",", ".")) : undefined;
    const nuevos: Record<string, string> = {};
    if (!nombre.trim()) nuevos.nombre = "Escribe un nombre para la deuda.";
    if (!(saldo > 0)) nuevos.saldo = "El saldo debe ser mayor que cero.";
    if (!(cuota > 0)) nuevos.cuota = "La cuota debe ser mayor que cero.";
    if (tasaNumero !== undefined && (!Number.isFinite(tasaNumero) || tasaNumero < 0 || tasaNumero > 100))
      nuevos.tasa = "Escribe un porcentaje válido, por ejemplo 2,5.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length) return;
    onGuardar({ id: nuevoId(), nombre: nombre.trim(), saldoInicial: saldo, cuota, tasa: tasaNumero, creadoEn: Date.now() });
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <div>
        <label htmlFor="nombre-deuda" className="etiqueta">
          Nombre
        </label>
        <input
          id="nombre-deuda"
          className={`campo ${errores.nombre ? "border-rose-500" : ""}`}
          value={nombre}
          maxLength={40}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Crédito moto, Tarjeta de crédito"
        />
        {errores.nombre && <p className="mt-1.5 text-sm font-semibold text-rose-600">{errores.nombre}</p>}
      </div>
      <CampoValor etiqueta="Saldo actual (lo que debes hoy)" valor={saldo} onCambio={setSaldo} error={errores.saldo} />
      <CampoValor etiqueta="Cuota mensual" valor={cuota} onCambio={setCuota} error={errores.cuota} />
      <div>
        <label htmlFor="tasa-deuda" className="etiqueta">
          Interés mensual <span className="font-normal text-suave">(opcional)</span>
        </label>
        <div className="relative">
          <input
            id="tasa-deuda"
            className={`campo pr-10 ${errores.tasa ? "border-rose-500" : ""}`}
            inputMode="decimal"
            value={tasa}
            onChange={(e) => setTasa(e.target.value.replace(/[^\d.,]/g, ""))}
            placeholder="Ej: 2,5"
          />
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-lg font-bold text-suave">%</span>
        </div>
        <p className={`mt-1.5 text-sm ${errores.tasa ? "font-semibold text-rose-600" : "text-suave"}`}>
          {errores.tasa ?? "Aparece en el extracto o en el contrato del crédito."}
        </p>
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

function FormularioAbono({
  deuda,
  onGuardar,
  onCancelar,
}: {
  deuda: DeudaConSaldo;
  onGuardar: (valor: number, fecha: string) => void;
  onCancelar: () => void;
}) {
  const [valor, setValor] = useState(Math.min(deuda.cuota, deuda.saldo));
  const [fecha, setFecha] = useState(hoyISO());
  const [error, setError] = useState("");

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!(valor > 0)) return setError("El abono debe ser mayor que cero.");
    if (valor > deuda.saldo) return setError(`El abono no puede ser mayor que el saldo (${pesos(deuda.saldo)}).`);
    onGuardar(valor, fecha || hoyISO());
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      <p className="rounded-2xl bg-stone-50 p-3 text-base">
        Saldo pendiente: <b>{pesos(deuda.saldo)}</b>
      </p>
      <CampoValor
        etiqueta="Valor del abono"
        valor={valor}
        onCambio={(v) => {
          setValor(v);
          setError("");
        }}
        error={error}
        ayuda="También quedará registrado como gasto fijo en Deudas y créditos."
        grande
      />
      <div>
        <label htmlFor="fecha-abono" className="etiqueta">
          Fecha
        </label>
        <input id="fecha-abono" type="date" className="campo" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button type="button" className="boton-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton-primario">
          Registrar
        </button>
      </div>
    </form>
  );
}
