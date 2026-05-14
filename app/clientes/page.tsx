"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "../../components/DashboardLayout";
import NuevoClienteModal from "../../components/NuevoClienteModal";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import EditarClienteModal from "../../components/EditarClienteModal";

import { supabase } from "../../lib/supabase";

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  cuit: string;
}

export default function ClientesPage() {

  const [clientes, setClientes] =
    useState<Cliente[]>([]);

  const [busqueda, setBusqueda] =
    useState("");

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [clienteEditar, setClienteEditar] =
    useState<any>(null);

  const [clienteEliminar, setClienteEliminar] =
    useState<any>(null);

  useEffect(() => {
    obtenerClientes();
  }, []);

  async function obtenerClientes() {

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setClientes(data || []);
  }

  async function eliminarCliente(id: number) {

    const { error } = await supabase
      .from("clientes")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    obtenerClientes();
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
            Clientes
          </h1>

          <p
            className="
              text-zinc-400
              mt-2
              text-sm
              md:text-base
            "
          >
            Gestión de clientes del taller
          </p>

        </div>

        <button
          onClick={() => setMostrarModal(true)}
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
          + Nuevo Cliente
        </button>

      </div>

      {/* BUSCADOR */}
      <div className="mb-6">

        <input
          type="text"
          placeholder="🔎 Buscar cliente, email o teléfono..."
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
                  Cliente
                </th>

                <th className="text-left p-4 md:p-6">
                  Teléfono
                </th>

                <th className="text-left p-4 md:p-6">
                  CUIT
                </th>

                <th className="text-left p-4 md:p-6">
                  Email
                </th>

                <th className="text-left p-4 md:p-6">
                  Dirección
                </th>

                <th className="text-left p-4 md:p-6">
                  Acciones
                </th>

              </tr>

            </thead>

            <tbody>

              {clientes

                .filter((cliente) => {

                  const texto =
                    busqueda.toLowerCase();

                  return (

                    cliente.nombre
                      ?.toLowerCase()
                      .includes(texto)

                    ||

                    cliente.email
                      ?.toLowerCase()
                      .includes(texto)

                    ||

                    cliente.telefono
                      ?.toLowerCase()
                      .includes(texto)

                  );

                })

                .map((cliente) => (

                  <tr
                    key={cliente.id}
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
                      {cliente.nombre}
                    </td>

                    <td className="p-4 md:p-6">
                      {cliente.telefono || "-"}
                    </td>

                    <td className="p-4 md:p-6">
                      {cliente.cuit || "-"}
                    </td>

                    <td className="p-4 md:p-6">
                      {cliente.email || "-"}
                    </td>

                    <td className="p-4 md:p-6">
                      {cliente.direccion || "-"}
                    </td>

                    {/* BOTONES */}
                    <td className="p-4 md:p-6">

                      <div className="flex gap-2">

                        {/* EDITAR */}
                        <button
                          onClick={() =>
                            setClienteEditar(cliente)
                          }
                          className="
                            bg-yellow-500/20
                            hover:bg-yellow-500/30
                            text-yellow-400
                            px-3
                            py-2
                            rounded-xl
                            transition
                            text-sm
                          "
                        >
                          ✏️
                        </button>

                        {/* ELIMINAR */}
                        <button
                          onClick={() =>
                            setClienteEliminar(cliente)
                          }
                          className="
                            bg-red-500/20
                            hover:bg-red-500/30
                            text-red-400
                            px-3
                            py-2
                            rounded-xl
                            transition
                            text-sm
                          "
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL NUEVO */}
      {mostrarModal && (

        <NuevoClienteModal
          onClose={() =>
            setMostrarModal(false)
          }
          onSuccess={obtenerClientes}
        />

      )}

      {/* MODAL EDITAR */}
      {clienteEditar && (

        <EditarClienteModal
          cliente={clienteEditar}
          onClose={() =>
            setClienteEditar(null)
          }
          onSuccess={obtenerClientes}
        />

      )}

      {/* MODAL ELIMINAR */}
      {clienteEliminar && (

        <ConfirmDeleteModal
          onClose={() =>
            setClienteEliminar(null)
          }
          onConfirm={async () => {

            await eliminarCliente(
              clienteEliminar.id
            );

            setClienteEliminar(null);

          }}
        />

      )}

    </DashboardLayout>

  );
}