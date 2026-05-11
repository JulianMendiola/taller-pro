"use client";

import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

interface Resultado {
  id: number;
  nombre?: string;
  patente?: string;
  marca?: string;
  modelo?: string;
}

export default function SearchBar() {

  const [busqueda, setBusqueda] = useState("");

  const [clientes, setClientes] = useState<Resultado[]>([]);
  const [vehiculos, setVehiculos] = useState<Resultado[]>([]);

  useEffect(() => {

    if (busqueda.length < 2) {
      setClientes([]);
      setVehiculos([]);
      return;
    }

    buscar();

  }, [busqueda]);

  async function buscar() {

    // CLIENTES
    const { data: clientesData } = await supabase
      .from("clientes")
      .select("*")
      .ilike("nombre", `%${busqueda}%`)
      .limit(5);

    // VEHICULOS
    const { data: vehiculosData } = await supabase
      .from("vehiculos")
      .select("*")
      .ilike("patente", `%${busqueda}%`)
      .limit(5);

    setClientes(clientesData || []);
    setVehiculos(vehiculosData || []);
  }

  return (

    <div className="relative w-full max-w-xl">

      {/* INPUT */}
      <input
        type="text"
        placeholder="Buscar cliente o patente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="
          w-full
          bg-zinc-900
          border border-zinc-800
          rounded-2xl
          px-5 py-4
          outline-none
          text-white
        "
      />

      {/* RESULTADOS */}
      {(clientes.length > 0 || vehiculos.length > 0) && (

        <div
          className="
            absolute
            top-full
            mt-3
            w-full
            bg-zinc-900
            border border-zinc-800
            rounded-2xl
            overflow-hidden
            z-50
          "
        >

          {/* CLIENTES */}
          {clientes.map((cliente) => (

            <div
              key={cliente.id}
              className="
                p-4
                border-b border-zinc-800
                hover:bg-zinc-800/50
                transition
              "
            >

              <p className="font-semibold">
                👤 {cliente.nombre}
              </p>

            </div>

          ))}

          {/* VEHICULOS */}
          {vehiculos.map((vehiculo) => (

            <div
              key={vehiculo.id}
              className="
                p-4
                border-b border-zinc-800
                hover:bg-zinc-800/50
                transition
              "
            >

              <p className="font-semibold text-blue-400">
                🚗 {vehiculo.patente}
              </p>

              <p className="text-zinc-400 text-sm">
                {vehiculo.marca} {vehiculo.modelo}
              </p>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}