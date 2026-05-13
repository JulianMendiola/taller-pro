"use client";

import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface Cliente {
  id: number;
  nombre: string;
}

export default function NuevoVehiculoModal({
  onClose,
  onSuccess,
}: Props) {

  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [clienteId, setClienteId] = useState("");

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [patente, setPatente] = useState("");

  useEffect(() => {
    obtenerClientes();
  }, []);

  async function obtenerClientes() {

    const { data } = await supabase
      .from("clientes")
      .select("id, nombre");

    setClientes(data || []);
  }

  async function crearVehiculo() {

    const { error } = await supabase
      .from("vehiculos")
      .insert({

        cliente_id: clienteId,

        marca,
        modelo,
        patente,

      });

    if (error) {
      console.error(error);
      return;
    }

    onSuccess();
    onClose();
  }

  return (

    <div
      className="
        fixed inset-0
        bg-black/70
        flex items-center justify-center
        z-50
      "
    >

      <div
        className="
          bg-zinc-900
          border border-zinc-800
          rounded-3xl
          p-8
          w-full
          max-w-xl
        "
      >

        <h2 className="text-3xl font-bold mb-6">
          Nuevo Vehículo
        </h2>

        <div className="space-y-4">

          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="
              w-full
              bg-zinc-950
              border border-zinc-800
              rounded-2xl
              px-5 py-4
              outline-none
            "
          >

            <option value="">
              Seleccionar cliente
            </option>

            {clientes.map((cliente) => (

              <option
                key={cliente.id}
                value={cliente.id}
              >
                {cliente.nombre}
              </option>

            ))}

          </select>

          <input
            type="text"
            placeholder="Marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            className="
              w-full
              bg-zinc-950
              border border-zinc-800
              rounded-2xl
              px-5 py-4
              outline-none
            "
          />

          <input
            type="text"
            placeholder="Modelo"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            className="
              w-full
              bg-zinc-950
              border border-zinc-800
              rounded-2xl
              px-5 py-4
              outline-none
            "
          />

          <input
            type="text"
            placeholder="Patente"
            value={patente}
            onChange={(e) => setPatente(e.target.value)}
            className="
              w-full
              bg-zinc-950
              border border-zinc-800
              rounded-2xl
              px-5 py-4
              outline-none
            "
          />

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="
              px-5 py-3
              rounded-2xl
              bg-zinc-800
              hover:bg-zinc-700
              transition
            "
          >
            Cancelar
          </button>

          <button
            onClick={crearVehiculo}
            className="
              px-5 py-3
              rounded-2xl
              bg-blue-500
              hover:bg-blue-600
              transition
              font-semibold
            "
          >
            Guardar
          </button>

        </div>

      </div>

    </div>

  );
}