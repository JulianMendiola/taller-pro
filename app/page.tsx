"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type ResumenDia = {
  id: number;
  fecha: string;
  ingreso: number;
  egreso: number;
};

const MESES = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

function fechaLocalISO(fecha = new Date()) {
  const offset = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

function ultimos6Meses(mesRef: string, anioRef: string) {
  const result: { mes: string; anio: string; label: string }[] = [];
  const base = new Date(Number(anioRef), Number(mesRef) - 1, 1);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = String(d.getFullYear());
    const label = MESES[d.getMonth()].label.slice(0, 3);
    result.push({ mes, anio, label });
  }
  return result;
}

export default function DashboardPage() {
  const router = useRouter();

  const hoy = fechaLocalISO();
  const [anioActual, mesActual] = hoy.split("-");

  const [resumenes, setResumenes] = useState<ResumenDia[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [vehiculosTotal, setVehiculosTotal] = useState(0);
  const [trabajosMes, setTrabajosMes] = useState(0);

  useEffect(() => { verificarSesion(); }, []);

  async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    obtenerDatos();
  }

  async function obtenerDatos() {
    const primerDiaMes = `${anioActual}-${mesActual}-01`;
    const ultimoDiaMes = fechaLocalISO(new Date(Number(anioActual), Number(mesActual), 0));

    const [{ data: res }, { count: veh }, { count: trab }] = await Promise.all([
      supabase.from("resumen_diario").select("*").order("fecha", { ascending: false }),
      supabase.from("vehiculos").select("*", { count: "exact", head: true }),
      supabase
        .from("ordenes_trabajo")
        .select("*", { count: "exact", head: true })
        .gte("fecha", primerDiaMes)
        .lte("fecha", ultimoDiaMes),
    ]);

    setResumenes((res || []) as ResumenDia[]);
    setVehiculosTotal(veh || 0);
    setTrabajosMes(trab || 0);
  }

  const aniosDisponibles = useMemo(() => {
    const anios = new Set<string>([anioActual]);
    resumenes.forEach((r) => {
      const anio = r.fecha.slice(0, 4);
      if (anio) anios.add(anio);
    });
    return Array.from(anios).sort((a, b) => Number(b) - Number(a));
  }, [anioActual, resumenes]);

  const resumenesMes = useMemo(() => {
    return resumenes.filter((r) => {
      const [anio, mes] = r.fecha.slice(0, 10).split("-");
      return anio === anioSeleccionado && mes === mesSeleccionado;
    });
  }, [resumenes, mesSeleccionado, anioSeleccionado]);

  const { ingresos, egresos } = useMemo(() => {
    const ing = resumenesMes.reduce((acc, r) => acc + Number(r.ingreso), 0);
    const egr = resumenesMes.reduce((acc, r) => acc + Number(r.egreso), 0);
    return { ingresos: ing, egresos: egr };
  }, [resumenesMes]);

  const balance = ingresos - egresos;

  const datosTendencia = useMemo(() => {
    const periodos = ultimos6Meses(mesSeleccionado, anioSeleccionado);
    return periodos.map(({ mes, anio, label }) => {
      const del_mes = resumenes.filter((r) => {
        const [ra, rm] = r.fecha.slice(0, 10).split("-");
        return ra === anio && rm === mes;
      });
      const ing = del_mes.reduce((acc, r) => acc + Number(r.ingreso), 0);
      const egr = del_mes.reduce((acc, r) => acc + Number(r.egreso), 0);
      return { label, ingresos: ing, egresos: egr };
    });
  }, [resumenes, mesSeleccionado, anioSeleccionado]);

  const nombreMes = MESES.find((m) => m.value === mesSeleccionado)?.label ?? "";

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold">Dashboard</h1>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            Resumen general del taller
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none text-sm"
          >
            {MESES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none text-sm"
          >
            {aniosDisponibles.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs FINANCIEROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-1 text-sm">Entró — {nombreMes}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-green-400">
            ${ingresos.toLocaleString("es-AR")}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-1 text-sm">Salió — {nombreMes}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-red-400">
            ${egresos.toLocaleString("es-AR")}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-1 text-sm">Ganancia — {nombreMes}</p>
          <h2 className={`text-3xl md:text-4xl font-bold ${balance >= 0 ? "text-blue-400" : "text-red-400"}`}>
            {balance >= 0 ? "+" : ""}${balance.toLocaleString("es-AR")}
          </h2>
        </div>
      </div>

      {/* KPIs OPERATIVOS */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8 text-center">
          <p className="text-zinc-400 text-sm mb-1">Vehículos totales</p>
          <p className="text-3xl font-bold">{vehiculosTotal}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8 text-center">
          <p className="text-zinc-400 text-sm mb-1">Trabajos — {nombreMes}</p>
          <p className="text-3xl font-bold text-yellow-400">{trabajosMes}</p>
        </div>
      </div>

      {/* GRÁFICO TENDENCIA 6 MESES */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
        <h2 className="text-xl md:text-2xl font-bold mb-1">Entró vs Salió</h2>
        <p className="text-zinc-400 text-sm mb-6">Últimos 6 meses</p>

        <div className="h-[260px] md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosTendencia} barCategoryGap="30%" barGap={4}>
              <XAxis
                dataKey="label"
                tick={{ fill: "#a1a1aa", fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [`$${Number(value).toLocaleString("es-AR")}`]}
              />
              <Legend
                formatter={(value) => value === "ingresos" ? "Entró" : "Salió"}
                wrapperStyle={{ color: "#a1a1aa", fontSize: 13 }}
              />
              <Bar dataKey="ingresos" fill="#4ade80" radius={[6, 6, 0, 0]} />
              <Bar dataKey="egresos" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
