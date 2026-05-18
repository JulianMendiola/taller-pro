"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/DashboardLayout";

import { supabase } from "@/lib/supabase";

interface Orden {

  id: number;

  descripcion: string;

  estado: string;

  patente: string;

  marca: string;

  modelo: string;

  cliente: string;

  telefono: string;

}

export default function OrdenesPage() {

  const router = useRouter();

  const [ordenes, setOrdenes] =
    useState<Orden[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

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

    obtenerOrdenes();
  }

  async function obtenerOrdenes() {

    const { data, error } = await supabase

      .from("ordenes_trabajo")

      .select(`
        id,
        descripcion,
        estado,
        vehiculos (
          patente,
          marca,
          modelo,
          clientes (
            nombre,
            telefono
          )
        )
      `);

    if (error) {

      console.error(error);

      return;
    }

    const ordenesTransformadas =

      data.map((orden: any) => ({

        id: orden.id,

        descripcion: orden.descripcion,

        estado: orden.estado,

        patente:
          orden.vehiculos?.patente || "-",

        marca:
          orden.vehiculos?.marca || "-",

        modelo:
          orden.vehiculos?.modelo || "-",

        cliente:
          orden.vehiculos?.clientes?.nombre || "-",

        telefono:
          orden.vehiculos?.clientes?.telefono || "-",

      }));

    setOrdenes(ordenesTransformadas);
  }

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
          Órdenes de Trabajo
        </h1>

        <p
          className="
            text-zinc-400
            mt-2
            text-sm
            md:text-base
          "
        >
          Gestión de trabajos realizados
        </p>

      </div>

      {/* BUSCADOR */}
      <div className="mb-6">

        <input
          type="text"
          placeholder="🔎 Buscar..."
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
              min-w-[900px]
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
                  Vehículo
                </th>

                <th className="text-left p-4 md:p-6">
                  Cliente
                </th>

                <th className="text-left p-4 md:p-6">
                  Teléfono
                </th>

                <th className="text-left p-4 md:p-6">
                  Trabajo
                </th>

                <th className="text-left p-4 md:p-6">
                  Estado
                </th>

              </tr>

            </thead>

            <tbody>

              {ordenes

                .filter((orden) => {

                  const texto =
                    busqueda.toLowerCase();

                  return (

                    orden.patente
                      .toLowerCase()
                      .includes(texto)

                    ||

                    orden.cliente
                      .toLowerCase()
                      .includes(texto)

                    ||

                    orden.descripcion
                      .toLowerCase()
                      .includes(texto)

                  );

                })

                .map((orden) => (

                  <tr
                    key={orden.id}
                    className="
                      border-b
                      border-zinc-800
                      hover:bg-zinc-800/40
                      transition
                    "
                  >

                    <td className="p-4 md:p-6">

                      <div
                        className="
                          font-semibold
                          text-blue-400
                        "
                      >
                        {orden.patente}
                      </div>

                      <div
                        className="
                          text-sm
                          text-zinc-400
                        "
                      >
                        {orden.marca} {orden.modelo}
                      </div>

                    </td>

                    <td className="p-4 md:p-6">
                      {orden.cliente}
                    </td>

                    <td className="p-4 md:p-6">
                      {orden.telefono}
                    </td>

                    <td className="p-4 md:p-6 font-semibold">
                      {orden.descripcion}
                    </td>

                    <td className="p-4 md:p-6">

                      <span
                        className={`
                          px-3
                          py-2
                          rounded-xl
                          text-xs
                          md:text-sm
                          font-semibold

                          ${
                            orden.estado === "Finalizado"

                              ? `
                                bg-green-500/20
                                text-green-400
                              `

                              : `
                                bg-yellow-500/20
                                text-yellow-400
                              `
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

      </div>

    </DashboardLayout>

  );
}