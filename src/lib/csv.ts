import { ahorradoEnMeta, pagadoDeDeuda, saldoDeDeuda } from "./calculos";
import { hoyISO } from "./formato";
import type { DatosApp } from "./tipos";

// Excel en español usa punto y coma como separador de columnas
const SEP = ";";

function celda(valor: string | number | undefined): string {
  const texto = valor === undefined ? "" : String(valor);
  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

function fila(valores: (string | number | undefined)[]): string {
  return valores.map(celda).join(SEP);
}

export function generarCSV(datos: DatosApp): string {
  const lineas: string[] = [];

  if (datos.perfil.nombre) {
    lineas.push(fila(["Usuario", datos.perfil.nombre]));
    lineas.push("");
  }

  lineas.push("MOVIMIENTOS");
  lineas.push(fila(["Fecha", "Tipo", "Categoría", "Valor", "Fijo/Variable", "Gasto hormiga", "Descripción"]));
  const movimientos = [...datos.movimientos].sort((a, b) => a.fecha.localeCompare(b.fecha));
  for (const m of movimientos) {
    const esGasto = m.tipo === "gasto";
    lineas.push(
      fila([
        m.fecha,
        esGasto ? "Gasto" : "Ingreso",
        m.categoria,
        m.valor,
        esGasto ? (m.naturaleza === "fijo" ? "Fijo" : "Variable") : "",
        esGasto ? (m.hormiga ? "Sí" : "No") : "",
        m.descripcion,
      ]),
    );
  }

  lineas.push("");
  lineas.push("DEUDAS");
  lineas.push(fila(["Nombre", "Saldo inicial", "Pagado", "Saldo pendiente", "Cuota mensual", "Interés mensual (%)"]));
  for (const d of datos.deudas) {
    lineas.push(
      fila([
        d.nombre,
        d.saldoInicial,
        pagadoDeDeuda(d, datos.movimientos),
        saldoDeDeuda(d, datos.movimientos),
        d.cuota,
        d.tasa === undefined ? "" : String(d.tasa).replace(".", ","),
      ]),
    );
  }

  lineas.push("");
  lineas.push("METAS DE AHORRO");
  lineas.push(fila(["Meta", "Fecha", "Valor ahorrado"]));
  for (const meta of datos.metas) {
    for (const a of meta.aportes) lineas.push(fila([meta.nombre, a.fecha, a.valor]));
    lineas.push(fila([meta.nombre, "TOTAL", ahorradoEnMeta(meta)]));
  }

  return lineas.join("\r\n");
}

export function descargarCSV(datos: DatosApp): boolean {
  try {
    // El BOM (﻿) hace que Excel muestre bien las tildes y la ñ
    const blob = new Blob(["﻿" + generarCSV(datos)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `cuentas-claras-${hoyISO()}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch {
    return false;
  }
}
