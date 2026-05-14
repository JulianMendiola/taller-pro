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

  const [vehiculos, setVehiculos] =
    useState<Vehiculo[]>([]);

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [busqueda, setBusqueda] =
    useState("");

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
      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-4
          mb-8
        "
      >

        <div>

          <h1
            className="
              text-3xl
              md:text-5xl
              font-bold
            "
          >
            Vehículos
          </h1>

          <p
            className="
              text-zinc-400
              mt-2
              text-sm
              md:text-base
            "
          >
            Gestión de vehículos del taller
          </p>

        </div>

        <button
          onClick={() =>
            setMostrarModal(true)
          }
          className="
            bg-blue-500
            hover:bg-blue-600
            transition
            px-5
            py-3
            rounded-2xl
            font-semibold
            w-full
            md:w-auto
          "
        >
          + Nuevo Vehículo
        </button>

      </div>

      {/* BUSCADOR */}
      <div className="mb-6">

        <input
          type="text"
          placeholder="🔎 Buscar marca, modelo o patente..."
          value={busqueda}
          onChange={(e) =>
            setBusqueda(e.target.value)
          }
          className="
            w-full
            bg-zinc-900
            border border-zinc-800
            rounded-2xl
            px-4
            py-3
            md:px-5
            md:py-4
            outline-none
            text-white
          "
        />

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

        <div className="overflow-x-auto">

          <table
            className="
              w-full
              min-w-[700px]
            "
          >

            <thead
              className="
                border-b
                border-zinc-800
                text-zinc-400
              "
            >

              <tr>

                <th className="text-left p-4 md:p-6">
                  Marca
                </th>

                <th className="text-left p-4 md:p-6">
                  Modelo
                </th>

                <th className="text-left p-4 md:p-6">
                  Patente
                </th>

                <th className="text-left p-4 md:p-6">
                  Cliente
                </th>

              </tr>

            </thead>

            <tbody>

              {vehiculos

                .filter((vehiculo) => {

                  const texto =
                    busqueda.toLowerCase();

                  return (

                    vehiculo.marca
                      ?.toLowerCase()
                      .includes(texto)

                    ||

                    vehiculo.modelo
                      ?.toLowerCase()
                      .includes(texto)

                    ||

                    vehiculo.patente
                      ?.toLowerCase()
                      .includes(texto)

                  );

                })

                .map((vehiculo) => (

                  <tr
                    key={vehiculo.id}
                    className="
                      border-b
                      border-zinc-800
                      hover:bg-zinc-800/40
                      transition
                    "
                  >

                    <td
                      className="
                        p-4 md:p-6
                        font-semibold
                      "
                    >
                      {vehiculo.marca}
                    </td>

                    <td className="p-4 md:p-6">
                      {vehiculo.modelo}
                    </td>

                    <td
                      className="
                        p-4 md:p-6
                        text-blue-400
                        font-semibold
                      "
                    >

                      <Link
                        href={`/vehiculos/${vehiculo.id}`}
                        className="
                          hover:underline
                        "
                      >
                        {vehiculo.patente}
                      </Link>

                    </td>

                    <td className="p-4 md:p-6">
                      {vehiculo.clientes?.nombre || "-"}
                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}
      {mostrarModal && (

        <NuevoVehiculoModal
          onClose={() =>
            setMostrarModal(false)
          }
          onSuccess={obtenerVehiculos}
        />

      )}

    </DashboardLayout>

  );
}