"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "../../components/DashboardLayout";
import { supabase } from "../../lib/supabase";

interface Vehiculo {
  id: number;
  marca: string;
  modelo: string;
  patente: string;
}

export default function VehiculosPage() {

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);

  useEffect(() => {
    obtenerVehiculos();
  }, []);

  async function obtenerVehiculos() {

    const { data, error } = await supabase
      .from("vehiculos")
      .select("*")
      .order("id", { ascending: false });

    console.log(data);
    console.log(error);

    if (error) {
      console.error(error);
      return;
    }

    setVehiculos(data || []);
  }

  return (
    <DashboardLayout>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-4xl font-bold">
            Vehículos
          </h1>

          <p className="text-zinc-400 mt-1">
            Gestión de vehículos del taller
          </p>
        </div>

        <button className="bg-blue-500 hover:bg-blue-600 transition px-5 py-3 rounded-2xl font-semibold">
          + Nuevo Vehículo
        </button>

      </div>

      {/* TABLA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">

        {/* HEADER */}
        <div className="grid grid-cols-3 gap-4 p-5 border-b border-zinc-800 text-zinc-400 text-sm font-semibold">

          <div>Marca</div>
          <div>Modelo</div>
          <div>Patente</div>

        </div>

        {/* FILAS */}
        <div>

          {vehiculos.map((vehiculo) => (

            <div
              key={vehiculo.id}
              className="grid grid-cols-3 gap-4 p-5 border-b border-zinc-800 hover:bg-zinc-800/40 transition"
            >

              <div className="font-semibold">
                {vehiculo.marca}
              </div>

              <div className="text-zinc-400">
                {vehiculo.modelo}
              </div>

              <div className="text-blue-400 font-semibold">
                {vehiculo.patente}
              </div>

            </div>

          ))}

        </div>

      </div>

    </DashboardLayout>
  );
}