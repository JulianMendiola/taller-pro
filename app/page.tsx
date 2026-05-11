"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "../components/DashboardLayout";
import NuevoClienteModal from "../components/NuevoClienteModal";

import { supabase } from "../lib/supabase";

interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  cuit: string;
  email: string;
  direccion: string;
}

export default function ClientesPage() {

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);

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

    const confirmar = confirm(
      "¿Eliminar cliente?"
    );

    if (!confirmar) return;

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
      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Clientes
          </h1>

          <p className="text-zinc-400 mt-1">
            Gestión de clientes del taller
          </p>

        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="
            bg-blue-500
            hover:bg-blue-600
            transition
            px-5 py-3
            rounded-2xl
            font-semibold
          "
        >
          + Nuevo Cliente
        </button>

      </div>

      {/* TABLA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

        {/* HEADER TABLA */}
        <div
          className="
            grid grid-cols-6 gap-4
            p-5
            border-b border-zinc-800
            text-zinc-400
            text-sm
            font-semibold
          "
        >

          <div>Cliente</div>
          <div>Teléfono</div>
          <div>CUIT</div>
          <div>Email</div>
          <div>Dirección</div>
          <div>Acciones</div>

        </div>

        {/* FILAS */}
        <div>

          {clientes.map((cliente) => (

            <div
              key={cliente.id}
              className="
                grid grid-cols-6 gap-4
                p-5
                border-b border-zinc-800
                hover:bg-zinc-800/40
                transition
              "
            >

              <div className="font-semibold">
                {cliente.nombre}
              </div>

              <div className="text-zinc-400">
                {cliente.telefono || "-"}
              </div>

              <div className="text-zinc-400">
                {cliente.cuit || "-"}
              </div>

              <div className="text-zinc-400">
                {cliente.email || "-"}
              </div>

              <div className="text-zinc-400">
                {cliente.direccion || "-"}
              </div>

              {/* ACCIONES */}
              <div className="flex gap-3">

                <button
                  className="
                    bg-yellow-500/20
                    text-yellow-400
                    px-3 py-1
                    rounded-xl
                    hover:bg-yellow-500/30
                    transition
                  "
                >
                  ✏️
                </button>

                <button
                  onClick={() => eliminarCliente(cliente.id)}
                  className="
                    bg-red-500/20
                    text-red-400
                    px-3 py-1
                    rounded-xl
                    hover:bg-red-500/30
                    transition
                  "
                >
                  🗑️
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* MODAL */}
      {mostrarModal && (

        <NuevoClienteModal
          onClose={() => setMostrarModal(false)}
          onSuccess={obtenerClientes}
        />

      )}

    </DashboardLayout>

  );
}