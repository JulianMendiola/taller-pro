"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import DashboardLayout from "../../../components/DashboardLayout";

import { supabase } from "../../../lib/supabase";

interface Vehiculo {

  id: number;

  patente: string;

  marca: string;

  modelo: string;

  clientes?: {

    nombre: string;

    telefono: string;

  };

}

interface Orden {

  id: number;

  descripcion: string;

  estado: string;

  fecha: string;

}

export default function VehiculoDetallePage() {

  const params = useParams();

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);

  const [ordenes, setOrdenes] = useState<Orden[]>([]);

  useEffect(() => {

    if (params.id) {

      obtenerVehiculo();

      obtenerOrdenes();

    }

  }, [params.id]);

  async function obtenerVehiculo() {

    const { data, error } = await supabase

      .from("vehiculos")

      .select(`
        *,
        clientes (
          nombre,
          telefono
        )
      `)

      .eq("id", params.id)

      .single();

    if (error) {
      console.error(error);
      return;
    }

    setVehiculo(data);
  }

  async function obtenerOrdenes() {

    const { data, error } = await supabase

      .from("ordenes_trabajo")

      .select("*")

      .eq("vehiculo_id", params.id)

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

          {vehiculo?.patente}

        </h1>

        <p className="text-zinc-400 mt-2">

          {vehiculo?.marca} {vehiculo?.modelo}

        </p>

      </div>

      {/* INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

        {/* CLIENTE */}
        <div
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-3xl
            p-8
          "
        >

          <p className="text-zinc-400 mb-2">
            Cliente
          </p>

          <h2 className="text-3xl font-bold">
            {vehiculo?.clientes?.nombre || "-"}
          </h2>

        </div>

        {/* TELEFONO */}
        <div
          className="
            bg-zinc-900
            border border-zinc-800
            rounded-3xl
            p-8
          "
        >

          <p className="text-zinc-400 mb-2">
            Teléfono
          </p>

          <h2 className="text-3xl font-bold">
            {vehiculo?.clientes?.telefono || "-"}
          </h2>

        </div>

      </div>

      {/* HISTORIAL */}
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
            Historial del vehículo
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
                Trabajo
              </th>

              <th className="text-left p-6">
                Estado
              </th>

              <th className="text-left p-6">
                Fecha
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

                <td className="p-6 font-semibold">
                  {orden.descripcion}
                </td>

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

                <td className="p-6">
                  {new Date(orden.fecha).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </DashboardLayout>

  );
}