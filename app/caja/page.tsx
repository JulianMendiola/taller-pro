"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "../../components/DashboardLayout";
import { supabase } from "../../lib/supabase";

interface Orden {
  id: number;
  detalle: string;
  fecha: string;
}

export default function CajaPage() {

  const [ordenes, setOrdenes] = useState<Orden[]>([]);

  useEffect(() => {
    obtenerOrdenes();
  }, []);

  async function obtenerOrdenes() {

    const { data, error } = await supabase
      .from("ordenes_trabajo")
      .select("*")
      .order("id", { ascending: false });

    console.log(data);
    console.log(error);

    if (error) {
      console.error(error);
      return;
    }

    setOrdenes(data || []);
  }

  return (
    <DashboardLayout>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Órdenes de Trabajo
          </h1>

          <p className="text-zinc-400 mt-1">
            Historial de trabajos realizados
          </p>
        </div>

        <button className="bg-blue-500 hover:bg-blue-600 transition px-5 py-3 rounded-2xl font-semibold">
          + Nueva Orden
        </button>

      </div>

      {/* TABLA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-2 gap-4 p-5 border-b border-zinc-800 text-zinc-400 text-sm font-semibold">

          <div>Trabajo realizado</div>
          <div>Fecha</div>

        </div>

        {/* FILAS */}
        <div>

          {ordenes.map((orden) => (

            <div
              key={orden.id}
              className="grid grid-cols-2 gap-4 p-5 border-b border-zinc-800 hover:bg-zinc-800/40 transition"
            >

              <div className="font-semibold">
                {orden.detalle}
              </div>

              <div className="text-zinc-400">
                {orden.fecha || "-"}
              </div>

            </div>

          ))}

        </div>

      </div>

    </DashboardLayout>
  );
}