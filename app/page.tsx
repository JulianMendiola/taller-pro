"use client";

import { useEffect, useState } from "react";

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

  const router = useRouter();

  const [movimientos, setMovimientos] =
    useState<Movimiento[]>([]);

  const [ingresos, setIngresos] =
    useState(0);

  const [egresos, setEgresos] =
    useState(0);

  const [clientesTotal, setClientesTotal] =
    useState(0);

  const [vehiculosTotal, setVehiculosTotal] =
    useState(0);

  const [ordenesAbiertas, setOrdenesAbiertas] =
    useState(0);

  useEffect(() => {

    verificarSesion();

  }, []);

  async function verificarSesion() {

    const {

      data: { session },

    } = await supabase.auth.getSession();

    if (!session) {

      router.push("/login");

      return;
    }

    obtenerMovimientos();
  }

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

        ?.filter((m) =>
          m.tipo === "Entrada"
        )

        .reduce(
          (acc, mov) =>
            acc + Number(mov.monto),
          0
        ) || 0;

    const totalEgresos =

      data

        ?.filter((m) =>
          m.tipo === "Salida"
        )

        .reduce(
          (acc, mov) =>
            acc + Number(mov.monto),
          0
        ) || 0;

    setIngresos(totalIngresos);

    setEgresos(totalEgresos);

    obtenerKPIs();
  }

  async function obtenerKPIs() {

    const { count: clientes } =
      await supabase
        .from("clientes")
        .select("*", {
          count: "exact",
          head: true,
        });

    const { count: vehiculos } =
      await supabase
        .from("vehiculos")
        .select("*", {
          count: "exact",
          head: true,
        });

    const { count: ordenes } =
      await supabase
        .from("ordenes_trabajo")
        .select("*", {
          count: "exact",
          head: true,
        })
        .neq("estado", "Finalizado");

    setClientesTotal(clientes || 0);

    setVehiculosTotal(vehiculos || 0);

    setOrdenesAbiertas(ordenes || 0);
  }

  const balance =
    ingresos - egresos;

  return (

    <DashboardLayout>

      {/* HEADER */}
      <div className="mb-8">

        <h1
          className="
            text-3xl
            md:text-5xl
            font-bold
          "
        >
          Dashboard
        </h1>

        <p
          className="
            text-zinc-400
            mt-2
            text-sm
            md:text-base
          "
        >
          Resumen general del taller
        </p>

      </div>

      {/* FINANZAS */}
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
          md:gap-6
          mb-8
        "
      >

        {/* INGRESOS */}
        <div
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-3xl
            p-5 md:p-8
          "
        >

          <p
            className="
              text-zinc-400
              mb-2
              text-sm
            "
          >
            Ingresos
          </p>

          <h2
            className="
              text-3xl
              md:text-4xl
              font-bold
              text-green-400
            "
          >

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
            p-5 md:p-8
          "
        >

          <p
            className="
              text-zinc-400
              mb-2
              text-sm
            "
          >
            Egresos
          </p>

          <h2
            className="
              text-3xl
              md:text-4xl
              font-bold
              text-red-400
            "
          >

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
            p-5 md:p-8
          "
        >

          <p
            className="
              text-zinc-400
              mb-2
              text-sm
            "
          >
            Balance
          </p>

          <h2
            className={`
              text-3xl
              md:text-4xl
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
       {/* GRAFICO */}
<div
  className="
    bg-zinc-900
    border border-zinc-800
    rounded-3xl
    p-5 md:p-8
    mb-8
  "
>

  <h2
    className="
      text-xl
      md:text-2xl
      font-bold
      mb-6
    "
  >
    Resumen financiero
  </h2>

  <div className="h-[280px] md:h-[350px]">

    <ResponsiveContainer
      width="100%"
      height="100%"
    >

      <BarChart
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

        <XAxis dataKey="nombre" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="valor"
          radius={[10, 10, 0, 0]}
        />

      </BarChart>

    </ResponsiveContainer>

  </div>

</div>
    </DashboardLayout>

  );
}