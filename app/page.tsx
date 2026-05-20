"use client";

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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Movimiento {
  id: number;
  tipo: string;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

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

const COLORES_CATEGORIA = [
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#6366f1",
];

function fechaLocalISO(fecha = new Date()) {
  const offset = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

function partesFecha(valor: string) {
  const [anio = "", mes = "", dia = ""] = valor.slice(0, 10).split("-");
  return { anio, mes, dia };
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

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [clientesTotal, setClientesTotal] = useState(0);
  const [vehiculosTotal, setVehiculosTotal] = useState(0);
  const [ordenesAbiertas, setOrdenesAbiertas] = useState(0);

  useEffect(() => {
    verificarSesion();
  }, []);

  async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/login");
      return;
    }
    obtenerDatos();
  }

  async function obtenerDatos() {
    const [{ data }, { count: clientes }, { count: vehiculos }, { count: ordenes }] =
      await Promise.all([
        supabase
          .from("movimientos_financieros")
          .select("*")
          .order("fecha", { ascending: false }),
        supabase.from("clientes").select("*", { count: "exact", head: true }),
        supabase.from("vehiculos").select("*", { count: "exact", head: true }),
        supabase
          .from("ordenes_trabajo")
          .select("*", { count: "exact", head: true })
          .neq("estado", "Finalizado"),
      ]);

    setMovimientos(data || []);
    setClientesTotal(clientes || 0);
    setVehiculosTotal(vehiculos || 0);
    setOrdenesAbiertas(ordenes || 0);
  }

  const aniosDisponibles = useMemo(() => {
    const anios = new Set<string>([anioActual]);
    movimientos.forEach((m) => {
      const { anio } = partesFecha(m.fecha);
      if (anio) anios.add(anio);
    });
    return Array.from(anios).sort((a, b) => Number(b) - Number(a));
  }, [anioActual, movimientos]);

  const movimientosMes = useMemo(() => {
    return movimientos.filter((m) => {
      const { anio, mes } = partesFecha(m.fecha);
      return anio === anioSeleccionado && mes === mesSeleccionado;
    });
  }, [movimientos, mesSeleccionado, anioSeleccionado]);

  const { ingresos, egresos } = useMemo(() => {
    const ing = movimientosMes
      .filter((m) => m.tipo === "Entrada")
      .reduce((acc, m) => acc + Number(m.monto), 0);
    const egr = movimientosMes
      .filter((m) => m.tipo === "Salida")
      .reduce((acc, m) => acc + Number(m.monto), 0);
    return { ingresos: ing, egresos: egr };
  }, [movimientosMes]);

  const balance = ingresos - egresos;

  const datosTendencia = useMemo(() => {
    const periodos = ultimos6Meses(mesSeleccionado, anioSeleccionado);
    return periodos.map(({ mes, anio, label }) => {
      const del_mes = movimientos.filter((m) => {
        const p = partesFecha(m.fecha);
        return p.anio === anio && p.mes === mes;
      });
      const ing = del_mes
        .filter((m) => m.tipo === "Entrada")
        .reduce((acc, m) => acc + Number(m.monto), 0);
      const egr = del_mes
        .filter((m) => m.tipo === "Salida")
        .reduce((acc, m) => acc + Number(m.monto), 0);
      return { label, ingresos: ing, egresos: egr };
    });
  }, [movimientos, mesSeleccionado, anioSeleccionado]);

  const datosCategoria = useMemo(() => {
    const mapa: Record<string, number> = {};
    movimientosMes
      .filter((m) => m.tipo === "Salida")
      .forEach((m) => {
        const cat = m.categoria || "Sin categoría";
        mapa[cat] = (mapa[cat] || 0) + Number(m.monto);
      });
    return Object.entries(mapa)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [movimientosMes]);

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

        {/* SELECTOR MES / AÑO */}
        <div className="flex gap-3">
          <select
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none text-sm"
          >
            {MESES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none text-sm"
          >
            {aniosDisponibles.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs FINANCIEROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-1 text-sm">Ingresos — {nombreMes}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-green-400">
            ${ingresos.toLocaleString("es-AR")}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-1 text-sm">Egresos — {nombreMes}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-red-400">
            ${egresos.toLocaleString("es-AR")}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-1 text-sm">Balance — {nombreMes}</p>
          <h2
            className={`text-3xl md:text-4xl font-bold ${
              balance >= 0 ? "text-blue-400" : "text-red-400"
            }`}
          >
            ${balance.toLocaleString("es-AR")}
          </h2>
        </div>
      </div>

      {/* KPIs OPERATIVOS */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8 text-center">
          <p className="text-zinc-400 text-sm mb-1">Clientes</p>
          <p className="text-3xl font-bold">{clientesTotal}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8 text-center">
          <p className="text-zinc-400 text-sm mb-1">Vehículos</p>
          <p className="text-3xl font-bold">{vehiculosTotal}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8 text-center">
          <p className="text-zinc-400 text-sm mb-1">Órdenes abiertas</p>
          <p className="text-3xl font-bold text-yellow-400">{ordenesAbiertas}</p>
        </div>
      </div>

      {/* GRÁFICO TENDENCIA 6 MESES */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8 mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-1">
          Ingresos vs Egresos
        </h2>
        <p className="text-zinc-400 text-sm mb-6">Últimos 6 meses</p>

        <div className="h-[260px] md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datosTendencia}
              barCategoryGap="30%"
              barGap={4}
            >
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
                tickFormatter={(v) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                }
              />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "12px",
                  color: "#fff",
                }}
                formatter={(value) => [
                  `$${Number(value).toLocaleString("es-AR")}`,
                ]}
              />
              <Legend
                formatter={(value) =>
                  value === "ingresos" ? "Ingresos" : "Egresos"
                }
                wrapperStyle={{ color: "#a1a1aa", fontSize: 13 }}
              />
              <Bar
                dataKey="ingresos"
                fill="#4ade80"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="egresos"
                fill="#f87171"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICO CATEGORÍAS */}
      {datosCategoria.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-1">
            Distribución de gastos
          </h2>
          <p className="text-zinc-400 text-sm mb-6">
            Por categoría — {nombreMes} {anioSeleccionado}
          </p>

          <div className="h-[260px] md:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosCategoria}
                  cx="50%"
                  cy="50%"
                  innerRadius="45%"
                  outerRadius="70%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {datosCategoria.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        COLORES_CATEGORIA[index % COLORES_CATEGORIA.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value) => [
                    `$${Number(value).toLocaleString("es-AR")}`,
                  ]}
                />
                <Legend
                  wrapperStyle={{ color: "#a1a1aa", fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {datosCategoria.length === 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8 text-center">
          <p className="text-zinc-500 text-sm">
            Sin gastos registrados en {nombreMes} {anioSeleccionado}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
