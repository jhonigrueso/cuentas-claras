"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { datosVacios, guardarDatos, leerDatos } from "@/lib/almacenamiento";
import { mesActual } from "@/lib/formato";
import type { Aporte, DatosApp, Deuda, Movimiento } from "@/lib/tipos";

type Accion =
  | { tipo: "cargar"; datos: DatosApp }
  | { tipo: "agregarMovimiento"; movimiento: Movimiento }
  | { tipo: "editarMovimiento"; movimiento: Movimiento }
  | { tipo: "eliminarMovimiento"; id: string }
  | { tipo: "agregarDeuda"; deuda: Deuda }
  | { tipo: "eliminarDeuda"; id: string }
  | { tipo: "definirObjetivo"; metaId: string; objetivo: number | null }
  | { tipo: "agregarAporte"; metaId: string; aporte: Aporte }
  | { tipo: "eliminarAporte"; metaId: string; aporteId: string }
  | { tipo: "definirNombre"; nombre: string };

function reductor(estado: DatosApp, accion: Accion): DatosApp {
  switch (accion.tipo) {
    case "cargar":
      return accion.datos;
    case "definirNombre":
      return { ...estado, perfil: { ...estado.perfil, nombre: accion.nombre } };
    case "agregarMovimiento":
      return { ...estado, movimientos: [...estado.movimientos, accion.movimiento] };
    case "editarMovimiento":
      return {
        ...estado,
        movimientos: estado.movimientos.map((m) => (m.id === accion.movimiento.id ? accion.movimiento : m)),
      };
    case "eliminarMovimiento":
      return { ...estado, movimientos: estado.movimientos.filter((m) => m.id !== accion.id) };
    case "agregarDeuda":
      return { ...estado, deudas: [...estado.deudas, accion.deuda] };
    case "eliminarDeuda":
      // Los abonos ya hechos se conservan como gastos
      return {
        ...estado,
        deudas: estado.deudas.filter((d) => d.id !== accion.id),
        movimientos: estado.movimientos.map((m) => (m.deudaId === accion.id ? { ...m, deudaId: undefined } : m)),
      };
    case "definirObjetivo":
      return {
        ...estado,
        metas: estado.metas.map((m) => (m.id === accion.metaId ? { ...m, objetivoManual: accion.objetivo } : m)),
      };
    case "agregarAporte":
      return {
        ...estado,
        metas: estado.metas.map((m) =>
          m.id === accion.metaId ? { ...m, aportes: [...m.aportes, accion.aporte] } : m,
        ),
      };
    case "eliminarAporte":
      return {
        ...estado,
        metas: estado.metas.map((m) =>
          m.id === accion.metaId ? { ...m, aportes: m.aportes.filter((a) => a.id !== accion.aporteId) } : m,
        ),
      };
  }
}

interface ValorContexto {
  datos: DatosApp;
  /** false mientras se leen los datos del navegador */
  cargado: boolean;
  /** false si el navegador no deja guardar (por ejemplo, en modo incógnito estricto) */
  puedeGuardar: boolean;
  despachar: (accion: Accion) => void;
  /** Mes que se está viendo en Inicio y Movimientos (AAAA-MM) */
  mes: string;
  setMes: (mes: string) => void;
}

const DatosContext = createContext<ValorContexto | null>(null);

interface EstadoInterno {
  datos: DatosApp;
  cargado: boolean;
}

function reductorConCarga(estado: EstadoInterno, accion: Accion): EstadoInterno {
  return { datos: reductor(estado.datos, accion), cargado: estado.cargado || accion.tipo === "cargar" };
}

export function DatosProvider({ children }: { children: ReactNode }) {
  const [{ datos, cargado }, despachar] = useReducer(reductorConCarga, undefined, () => ({
    datos: datosVacios(),
    cargado: false,
  }));
  const [puedeGuardar, setPuedeGuardar] = useState(true);
  // "" = mes actual
  const [mes, setMes] = useState("");
  const primerGuardado = useRef(true);

  // 1. Leer localStorage solo en el cliente, después de montar (evita errores de hidratación)
  useEffect(() => {
    despachar({ tipo: "cargar", datos: leerDatos() });
  }, []);

  // 2. Guardar automáticamente cada cambio
  useEffect(() => {
    if (!cargado) return;
    if (primerGuardado.current) {
      // Lo que acabamos de leer ya está guardado
      primerGuardado.current = false;
      return;
    }
    setPuedeGuardar(guardarDatos(datos));
  }, [datos, cargado]);

  const valor = useMemo(
    () => ({ datos, cargado, puedeGuardar, despachar, mes: mes || mesActual(), setMes }),
    [datos, cargado, puedeGuardar, mes],
  );

  return <DatosContext.Provider value={valor}>{children}</DatosContext.Provider>;
}

export function useDatos(): ValorContexto {
  const contexto = useContext(DatosContext);
  if (!contexto) throw new Error("useDatos debe usarse dentro de <DatosProvider>");
  return contexto;
}
