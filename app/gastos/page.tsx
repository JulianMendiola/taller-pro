"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/DashboardLayout";

import { supabase } from "@/lib/supabase";

interface Movimiento {

  id: number;

  tipo: string;

  categoria: string;

  descripcion: string;

  monto: number;

  fecha: string;

}

export default function GastosPage() {

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  const [mesSeleccionado, setMesSeleccionado] = useState("04");

  const [ingresos, setIngresos] = useState(0);

  const [egresos, setEgresos] = useState(0);

  useEffect(() => {
    obtenerMovimientos();
  }, [mesSeleccionado]);

  async function obtenerMovimientos() {

    const { data, error } = await supabase

      .from("movimientos_financieros")

      .select("*")

      .order("fecha", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const filtrados =
      data?.filter((mov) => {

        const fecha = new Date(mov.fecha);

        const mes =
          String(fecha.getMonth() + 1)
            .padStart(2, "0");

        return mes === mesSeleccionado;

      }) || [];

    setMovimientos(filtrados);

    const totalIngresos =
      filtrados
        .filter((m) => m.tipo === "Entrada")
        .reduce((acc, mov) => acc + Number(mov.monto), 0);

    const totalEgresos =
      filtrados
        .filter((m) => m.tipo === "Salida")
        .reduce((acc, mov) => acc + Number(mov.monto), 0);

    setIngresos(totalIngresos);

    setEgresos(totalEgresos);
  }

  const balance = ingresos - egresos;

  return (

    <DashboardLayout>

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-5xl font-bold">
          Gastos
        </h1>

        <p className="text-zinc-400 mt-2">
          Control financiero mensual
        </p>

      </div>

      {/* FILTRO */}
      <div className="mb-8">

        <select

          value={mesSeleccionado}

          onChange={(e) =>
            setMesSeleccionado(e.target.value)
          }

          className="
            bg-zinc-900
            border border-zinc-800
            rounded-2xl
            px-5 py-4
            text-white
            outline-none
          "
        >

          <option value="01">Enero</option>

          <option value="02">Febrero</option>

          <option value="03">Marzo</option>

          <option value="04">Abril</option>

          <option value="05">Mayo</option>

          <option value="06">Junio</option>

          <option value="07">Julio</option>

          <option value="08">Agosto</option>

          <option value="09">Septiembre</option>

          <option value="10">Octubre</option>

          <option value="11">Noviembre</option>

          <option value="12">Diciembre</option>

        </select>

      </div>

      {/* KPIs */}
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
            Gastos
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
              text-4xl font-bold

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

      {/* TABLA */}
      <div
        className="
          bg-zinc-900
          border border-zinc-800
          rounded-3xl
          overflow-hidden
        "
      >

        <div className="p-6 border-b border-zinc-800">

          <h2 className="text-2xl font-bold">
            Movimientos del mes
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

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
                        px-4 py-2
                        rounded-xl
                        text-sm
                        font-semibold

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
                    {Number(mov.monto)
                      .toLocaleString("es-AR")}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </DashboardLayout>

  );
}