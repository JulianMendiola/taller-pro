"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "../../components/DashboardLayout";
import NuevoVehiculoModal from "../../components/NuevoVehiculoModal";
import { supabase } from "../../lib/supabase";

interface Vehiculo {

  id: number;

  marca: string;

  modelo: string;

  patente: string;

  clientes?: {
    nombre: string;
  };

}

export default function VehiculosPage() {

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  useEffect(() => {
    obtenerVehiculos();
  }, []);

  async function obtenerVehiculos() {

    const { data, error } = await supabase

      .from("vehiculos")

      .select(`
        *,
        clientes (
          nombre
        )
      `)

      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setVehiculos(data || []);
  }

  return (

    <DashboardLayout>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-5xl font-bold">
            Vehículos
          </h1>

          <p className="text-zinc-400 mt-2">
            Gestión de vehículos del taller
          </p>

        </div>

        <button
  onClick={() => setMostrarModal(true)}
  className="
    bg-blue-500
    hover:bg-blue-600
    transition
    px-6 py-4
    rounded-2xl
    font-semibold
  "
>
  + Nuevo Vehículo
</button>

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
                Marca
              </th>

              <th className="text-left p-6">
                Modelo
              </th>

              <th className="text-left p-6">
                Patente
              </th>

              <th className="text-left p-6">
                Cliente
              </th>

            </tr>

          </thead>

          <tbody>

            {vehiculos.map((vehiculo) => (

              <tr
                key={vehiculo.id}
                className="
                  border-b border-zinc-800
                  hover:bg-zinc-800/40
                  transition
                "
              >

                <td className="p-6 font-semibold">
                  {vehiculo.marca}
                </td>

                <td className="p-6">
                  {vehiculo.modelo}
                </td>

                <td className="p-6 text-blue-400 font-semibold">
                  <Link
  href={`/vehiculos/${vehiculo.id}`}
  className="text-blue-400 hover:underline"
>
  {vehiculo.patente}
</Link>
                </td>

                <td className="p-6">
                  {vehiculo.clientes?.nombre || "-"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {mostrarModal && (

  <NuevoVehiculoModal
    onClose={() => setMostrarModal(false)}
    onSuccess={obtenerVehiculos}
  />

)}

    </DashboardLayout>

  );
}