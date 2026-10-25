"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useDatos } from "@/context/DatosContext";
import {
  ahorradoEnMeta,
  consejoDelMes,
  objetivoDeMeta,
  porcentaje,
  resumenDelMes,
} from "@/lib/calculos";
import { pesos } from "@/lib/formato";
import { ID_FONDO_EMERGENCIA } from "@/lib/tipos";
import Cargando from "../Cargando";
import GraficaDona from "../GraficaDona";
import SelectorMes from "../SelectorMes";

const ESTILO_CONSEJO = {
  alerta: "border-rose-200 bg-rose-50",
  aviso: "border-amber-200 bg-amber-50",
  bien: "border-emerald-200 bg-emerald-50",
};

export default function InicioVista() {
  const { datos, cargado, mes } = useDatos();
  const resumen = useMemo(() => resumenDelMes(datos.movimientos, mes), [datos.movimientos, mes]);
  const fondo = datos.metas.find((m) => m.id === ID_FONDO_EMERGENCIA);
  const ahorro = ahorradoEnMeta(fondo);
  const metaFondo = objetivoDeMeta(fondo, datos.movimientos);
  const consejo = consejoDelMes(resumen, ahorro, metaFondo);

  if (!cargado) return <Cargando />;

  const sinMovimientos = resumen.ingresos === 0 && resumen.gastos === 0;
  const saldoPositivo = resumen.saldo >= 0;
  const pctFijos = porcentaje(resumen.fijos, resumen.gastos);

  return (
    <div className="space-y-4">
      <SelectorMes />

      {/* Tarjetas principales */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Resumen del mes">
        <div className="tarjeta border-l-8 border-ingreso">
          <p className="text-sm font-bold text-suave">⬆️ Ingresos</p>
          <p className="mt-1 text-lg font-extrabold break-all tabular-nums min-[400px]:text-xl text-ingreso sm:text-2xl">{pesos(resumen.ingresos)}</p>
        </div>
        <div className="tarjeta border-l-8 border-gasto">
          <p className="text-sm font-bold text-suave">⬇️ Gastos</p>
          <p className="mt-1 text-lg font-extrabold break-all tabular-nums min-[400px]:text-xl text-gasto sm:text-2xl">{pesos(resumen.gastos)}</p>
        </div>
        <div
          className={`tarjeta col-span-2 sm:col-span-1 ${saldoPositivo ? "bg-emerald-50 ring-2 ring-emerald-200" : "bg-rose-50 ring-2 ring-rose-200"}`}
        >
          <p className="text-sm font-bold text-suave">💰 Saldo</p>
          <p className={`mt-1 text-3xl font-extrabold break-all ${saldoPositivo ? "text-ingreso" : "text-gasto"}`}>
            {pesos(resumen.saldo)}
          </p>
          {!saldoPositivo && (
            <p className="mt-1 font-bold text-rose-700" role="alert">
              Estás gastando más de lo que ganas
            </p>
          )}
        </div>
      </section>

      {/* Consejo */}
      <section className={`rounded-3xl border-2 p-5 ${ESTILO_CONSEJO[consejo.tono]}`} aria-label="Consejo del mes">
        <div className="flex gap-3">
          <span className="text-3xl" aria-hidden>
            {consejo.icono}
          </span>
          <div>
            <h2 className="text-lg font-extrabold">{consejo.titulo}</h2>
            <p className="mt-1 text-base">{consejo.texto}</p>
          </div>
        </div>
      </section>

      {sinMovimientos ? (
        <section className="tarjeta text-center">
          <p className="text-5xl" aria-hidden>
            📒
          </p>
          <h2 className="mt-2 text-xl font-extrabold">Aún no hay registros este mes</h2>
          <p className="mt-1 text-suave">Anota tu primer ingreso o gasto para ver aquí tu resumen.</p>
          <Link href="/registrar" className="boton-primario mt-4 w-full sm:w-auto">
            Registrar ahora
          </Link>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Dona por categoría */}
          <section className="tarjeta lg:col-span-2">
            <h2 className="mb-3 text-lg font-extrabold">¿En qué se va la plata?</h2>
            {resumen.gastos > 0 ? (
              <GraficaDona datos={resumen.porCategoria} total={resumen.gastos} />
            ) : (
              <p className="text-suave">Todavía no has registrado gastos este mes.</p>
            )}
          </section>

          {/* Fijos vs variables */}
          <section className="tarjeta">
            <h2 className="mb-3 text-lg font-extrabold">Gastos fijos y variables</h2>
            <div
              className="flex h-6 w-full overflow-hidden rounded-full bg-stone-100"
              role="img"
              aria-label={`Fijos ${pctFijos} %, variables ${resumen.gastos ? 100 - pctFijos : 0} %`}
            >
              {resumen.gastos > 0 && (
                <>
                  <div className="h-full bg-violet-500" style={{ width: `${pctFijos}%` }} />
                  <div className="h-full bg-amber-400" style={{ width: `${100 - pctFijos}%` }} />
                </>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-violet-50 p-3">
                <p className="flex items-center gap-2 text-sm font-bold text-violet-800">
                  <span className="h-3 w-3 rounded-full bg-violet-500" aria-hidden /> Fijos
                </p>
                <p className="mt-1 text-lg font-extrabold">{pesos(resumen.fijos)}</p>
                <p className="text-sm text-suave">{resumen.gastos ? pctFijos : 0} % del total</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3">
                <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
                  <span className="h-3 w-3 rounded-full bg-amber-400" aria-hidden /> Variables
                </p>
                <p className="mt-1 text-lg font-extrabold">{pesos(resumen.variables)}</p>
                <p className="text-sm text-suave">{resumen.gastos ? 100 - pctFijos : 0} % del total</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-suave">
              Los gastos <b>variables</b> son los más fáciles de recortar.
            </p>
          </section>

          {/* Gastos hormiga */}
          <section className="tarjeta bg-amber-50/60">
            <h2 className="mb-1 text-lg font-extrabold">🐜 Gastos hormiga</h2>
            <p className="text-sm text-suave">
              {resumen.cantidadHormiga === 1 ? "1 gasto pequeño" : `${resumen.cantidadHormiga} gastos pequeños`} este mes
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-bold text-suave">Este mes</p>
                <p className="text-2xl font-extrabold">{pesos(resumen.hormiga)}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-suave">En un año serían</p>
                <p className="text-2xl font-extrabold text-gasto">{pesos(resumen.hormiga * 12)}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-suave">Poquito a poquito, se lleva una buena parte del sueldo.</p>
          </section>
        </div>
      )}

      {/* Acceso rápido al fondo de emergencia */}
      <Link href="/metas" className="tarjeta flex items-center gap-4 hover:ring-2 hover:ring-marca/30">
        <span className="text-3xl" aria-hidden>
          🛟
        </span>
        <span className="flex-1">
          <span className="block font-extrabold">Fondo de emergencia</span>
          <span className="block text-sm text-suave">
            {metaFondo > 0
              ? `${pesos(ahorro)} de ${pesos(metaFondo)} · ${porcentaje(ahorro, metaFondo)} %`
              : `Llevas ${pesos(ahorro)} ahorrados`}
          </span>
        </span>
        <span className="text-xl text-marca" aria-hidden>
          ›
        </span>
      </Link>
    </div>
  );
}
