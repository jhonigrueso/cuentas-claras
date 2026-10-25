"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { porcentaje } from "@/lib/calculos";
import { pesos } from "@/lib/formato";

interface Dato {
  nombre: string;
  icono: string;
  color: string;
  valor: number;
}

export default function GraficaDona({ datos, total }: { datos: Dato[]; total: number }) {
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[220px_1fr]">
      <div className="relative mx-auto h-[220px] w-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datos}
              dataKey="valor"
              nameKey="nombre"
              innerRadius={68}
              outerRadius={104}
              paddingAngle={datos.length > 1 ? 2 : 0}
              stroke="#fff"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {datos.map((d) => (
                <Cell key={d.nombre} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => pesos(Number(v))}
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,.12)" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm text-suave">Total gastos</span>
          <span className="text-lg font-extrabold">{pesos(total)}</span>
        </div>
      </div>

      <ul className="space-y-2">
        {datos.map((d) => (
          <li key={d.nombre} className="flex items-center gap-3">
            <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: d.color }} aria-hidden />
            <span className="flex-1 text-base">
              <span aria-hidden>{d.icono}</span> {d.nombre}
            </span>
            <span className="text-right">
              <span className="block font-bold">{pesos(d.valor)}</span>
              <span className="block text-xs text-suave">{porcentaje(d.valor, total)} %</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
