"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { supabase } from "../../lib/supabase";

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

        <button className="bg-blue-500 hover:bg-blue-600 transition px-5 py-3 rounded-2xl font-semibold">
          + Nuevo Cliente
        </button>

      </div>

      {/* TABLA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

        {/* HEADER TABLA */}
        <div className="grid grid-cols-5 gap-4 p-5 border-b border-zinc-800 text-zinc-400 text-sm font-semibold">

          <div>Cliente</div>
          <div>Teléfono</div>
          <div>CUIT</div>
          <div>Email</div>
          <div>Dirección</div>

        </div>

        {/* FILAS */}
        <div>

          {clientes.map((cliente) => (

            <div
              key={cliente.id}
              className="grid grid-cols-5 gap-4 p-5 border-b border-zinc-800 hover:bg-zinc-800/40 transition"
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

            </div>

          ))}

        </div>

      </div>

    </DashboardLayout>
  );
}