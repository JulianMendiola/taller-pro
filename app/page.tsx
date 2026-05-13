"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";

import { supabase } from "../lib/supabase";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Movimiento {

  id: number;

  tipo: string;

  categoria: string;

  descripcion: string;

  monto: number;

  fecha: string;

}

export default function DashboardPage() {

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  const [ingresos, setIngresos] = useState(0);

  const [egresos, setEgresos] = useState(0);

  const [clientesTotal, setClientesTotal] = useState(0);

  const [vehiculosTotal, setVehiculosTotal] = useState(0);

  const [ordenesAbiertas, setOrdenesAbiertas] = useState(0);

  useEffect(() => {
    obtenerMovimientos();
  }, []);

  async function obtenerMovimientos() {

    const { data, error } = await supabase

      .from("movimientos_financieros")

      .select("*")

      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setMovimientos(data || []);

    const totalIngresos =
      data
        ?.filter((m) => m.tipo === "Entrada")
        .reduce((acc, mov) => acc + Number(mov.monto), 0) || 0;

    const totalEgresos =
      data
        ?.filter((m) => m.tipo === "Salida")
        .reduce((acc, mov) => acc + Number(mov.monto), 0) || 0;

    setIngresos(totalIngresos);

    setEgresos(totalEgresos);

    obtenerKPIs();
  }

  async function obtenerKPIs() {

    const { count: clientes } = await supabase
      .from("clientes")
      .select("*", { count: "exact", head: true });

    const { count: vehiculos } = await supabase
      .from("vehiculos")
      .select("*", { count: "exact", head: true });

    const { count: ordenes } = await supabase
      .from("ordenes_trabajo")
      .select("*", { count: "exact", head: true })
      .neq("estado", "Finalizado");

    setClientesTotal(clientes || 0);

    setVehiculosTotal(vehiculos || 0);

    setOrdenesAbiertas(ordenes || 0);
  }

  const balance = ingresos - egresos;

  return (

    <DashboardLayout>

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-5xl font-bold">
          Dashboard
        </h1>

        <p className="text-zinc-400 mt-2">
          Resumen general del taller
        </p>

      </div>

      {/* FINANZAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* INGRESOS */}
        <div
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-3xl
            p-8
          "
        >

          <p className="text-zinc-400 mb-2">
            Ingresos
          </p>

          <h2 className="text-4xl font-bold text-green-400">

            $
            {ingresos.toLocaleString("es-AR")}

          </h2>

        </div>

        {/* EGRESOS */}
        <div
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-3xl
            p-8
          "
        >

          <p className="text-zinc-400 mb-2">
            Egresos
          </p>

          <h2 className="text-4xl font-bold text-red-400">

            $
            {egresos.toLocaleString("es-AR")}

          </h2>

        </div>

        {/* BALANCE */}
        <div
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-3xl
            p-8
          "
        >

          <p className="text-zinc-400 mb-2">
            Balance
          </p>

          <h2
            className={`
              text-4xl
              font-bold

              ${
                balance >= 0
                  ? "text-blue-400"
                  : "text-red-400"
              }
            `}
          >

            $
            {balance.toLocaleString("es-AR")}

          </h2>

        </div>

      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        {/* CLIENTES */}
        <div
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-3xl
            p-8
          "
        >

          <p className="text-zinc-400 mb-2">
            Clientes
          </p>

          <h2 className="text-4xl font-bold">
            {clientesTotal}
          </h2>

        </div>

        {/* VEHÍCULOS */}
        <div
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-3xl
            p-8
          "
        >

          <p className="text-zinc-400 mb-2">
            Vehículos
          </p>

          <h2 className="text-4xl font-bold">
            {vehiculosTotal}
          </h2>

        </div>

        {/* ORDENES */}
        <div
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-3xl
            p-8
          "
        >

          <p className="text-zinc-400 mb-2">
            Órdenes abiertas
          </p>

          <h2 className="text-4xl font-bold text-yellow-400">
            {ordenesAbiertas}
          </h2>

        </div>

      </div>

      {/* GRÁFICO */}
      <div
        className="
          bg-zinc-900
          border border-zinc-800
          rounded-3xl
          p-8
          mb-10
        "
      >

        <h2 className="text-2xl font-bold mb-8">
          Resumen financiero
        </h2>

        <div className="h-[350px]">

         <ResponsiveContainer width="100%" height="100%">

  <AreaChart
    data={[
      {
        nombre: "Ingresos",
        valor: ingresos,
      },
      {
        nombre: "Egresos",
        valor: egresos,
      },
      {
        nombre: "Balance",
        valor: balance,
      },
    ]}
  >

    <defs>

      <linearGradient
        id="colorValor"
        x1="0"
        y1="0"
        x2="0"
        y2="1"
      >

        <stop
          offset="5%"
          stopColor="#3b82f6"
          stopOpacity={0.8}
        />

        <stop
          offset="95%"
          stopColor="#3b82f6"
          stopOpacity={0}
        />

      </linearGradient>

    </defs>

    <CartesianGrid
      strokeDasharray="3 3"
      stroke="#27272a"
    />

    <XAxis
      dataKey="nombre"
      stroke="#71717a"
    />

    <YAxis
      stroke="#71717a"
    />

    <Tooltip />

    <Area
      type="monotone"
      dataKey="valor"
      stroke="#3b82f6"
      fillOpacity={1}
      fill="url(#colorValor)"
      strokeWidth={4}
    />

  </AreaChart>

</ResponsiveContainer>

        </div>

      </div>

      {/* MOVIMIENTOS */}
      <div
        className="
          bg-zinc-900
          border border-zinc-800
          rounded-3xl
          overflow-hidden
          max-h-[700px]
          overflow-y-auto
        "
      >

        <div className="p-6 border-b border-zinc-800">

          <h2 className="text-2xl font-bold">
            Movimientos recientes
          </h2>

        </div>

        <table className="w-full">

          <thead
            className="
              border-b border-zinc-800
              text-zinc-400
            "
          >

            <tr>

              <th className="text-left p-6">
                Tipo
              </th>

              <th className="text-left p-6">
                Categoría
              </th>

              <th className="text-left p-6">
                Descripción
              </th>

              <th className="text-left p-6">
                Monto
              </th>

            </tr>

          </thead>

          <tbody>

            {movimientos.map((mov) => (

              <tr
                key={mov.id}
                className="
                  border-b border-zinc-800
                  hover:bg-zinc-800/40
                  transition
                "
              >

                <td className="p-6">

                  <span
                    className={`
                      px-4 py-2 rounded-xl text-sm font-semibold

                      ${
                        mov.tipo === "Entrada"
                          ? "bg-green-500/20 text-green-400"

                          : "bg-red-500/20 text-red-400"
                      }
                    `}
                  >

                    {mov.tipo}

                  </span>

                </td>

                <td className="p-6">
                  {mov.categoria}
                </td>

                <td className="p-6">
                  {mov.descripcion}
                </td>

                <td className="p-6 font-semibold">

                  $
                  {Number(mov.monto).toLocaleString("es-AR")}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>

  );
}