"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";

import { supabase } from "../lib/supabase";

interface Orden {

  id: number;

  descripcion: string;

  estado: string;

  vehiculos?: {

    patente: string;

    marca: string;

    modelo: string;

    clientes?: {
      nombre: string;
      telefono: string;
    };

  };

}

export default function OrdenesPage() {

  const [ordenes, setOrdenes] = useState<Orden[]>([]);

  useEffect(() => {
    obtenerOrdenes();
  }, []);

  async function obtenerOrdenes() {

    const { data, error } = await supabase

      .from("ordenes_trabajo")

      .select(`
        *,
        vehiculos (

          patente,
          marca,
          modelo,

          clientes (
            nombre,
            telefono
          )

        )
      `)

      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setOrdenes(data || []);
  }

  return (

    <DashboardLayout>

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-5xl font-bold">
          Órdenes de Trabajo
        </h1>

        <p className="text-zinc-400 mt-2">
          Gestión de trabajos realizados
        </p>

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

        <table className="w-full">

          <thead
            className="
              border-b border-zinc-800
              text-zinc-400
            "
          >

            <tr>

              <th className="text-left p-6">
                Vehículo
              </th>

              <th className="text-left p-6">
                Cliente
              </th>

              <th className="text-left p-6">
                Teléfono
              </th>

              <th className="text-left p-6">
                Trabajo realizado
              </th>

              <th className="text-left p-6">
                Estado
              </th>

            </tr>

          </thead>

          <tbody>

            {ordenes.map((orden) => (

              <tr
                key={orden.id}
                className="
                  border-b border-zinc-800
                  hover:bg-zinc-800/40
                  transition
                "
              >

                {/* VEHÍCULO */}
                <td className="p-6">

                  <div className="font-semibold text-blue-400">
                    {orden.vehiculos?.patente || "-"}
                  </div>

                  <div className="text-sm text-zinc-400">
                    {orden.vehiculos?.marca} {orden.vehiculos?.modelo}
                  </div>

                </td>

                {/* CLIENTE */}
                <td className="p-6">
                  {orden.vehiculos?.clientes?.nombre || "-"}
                </td>

                {/* TELÉFONO */}
                <td className="p-6">
                  {orden.vehiculos?.clientes?.telefono || "-"}
                </td>

                {/* TRABAJO */}
                <td className="p-6 font-semibold">
                  {orden.descripcion}
                </td>

                {/* ESTADO */}
                <td className="p-6">

                  <span
                    className={`
                      px-4 py-2
                      rounded-xl
                      text-sm
                      font-semibold

                      ${
                        orden.estado === "Finalizado"
                          ? "bg-green-500/20 text-green-400"

                        : orden.estado === "En proceso"
                          ? "bg-yellow-500/20 text-yellow-400"

                        : "bg-red-500/20 text-red-400"
                      }
                    `}
                  >

                    {orden.estado}

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>

  );
}