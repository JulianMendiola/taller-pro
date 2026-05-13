"use client";

import { useState } from "react";

import { supabase } from "../lib/supabase";

interface Props {
  cliente: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditarClienteModal({
  cliente,
  onClose,
  onSuccess,
}: Props) {

  const [nombre, setNombre] = useState(cliente.nombre || "");
  const [telefono, setTelefono] = useState(cliente.telefono || "");
  const [cuit, setCuit] = useState(cliente.cuit || "");
  const [email, setEmail] = useState(cliente.email || "");
  const [direccion, setDireccion] = useState(cliente.direccion || "");

  async function guardarCambios() {

    const { error } = await supabase
      .from("clientes")
      .update({
        nombre,
        telefono,
        cuit,
        email,
        direccion,
      })
      .eq("id", cliente.id);

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
          Editar Cliente
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 outline-none"
          />

          <input
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Teléfono"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 outline-none"
          />

          <input
            type="text"
            value={cuit}
            onChange={(e) => setCuit(e.target.value)}
            placeholder="CUIT"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 outline-none"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 outline-none"
          />

          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Dirección"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 outline-none"
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
            onClick={guardarCambios}
            className="
              px-5 py-3
              rounded-2xl
              bg-blue-500
              hover:bg-blue-600
              transition
              font-semibold
            "
          >
            Guardar cambios
          </button>

        </div>

      </div>

    </div>

  );
}