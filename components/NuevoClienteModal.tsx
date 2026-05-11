"use client";

import { useState } from "react";

import { supabase } from "../lib/supabase";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function NuevoClienteModal({
  onClose,
  onSuccess,
}: Props) {

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");

  const [loading, setLoading] = useState(false);

  async function crearCliente() {

    if (!nombre) return;

    setLoading(true);

    const { error } = await supabase
      .from("clientes")
      .insert({
        nombre,
        telefono,
        email,
        direccion,
      });

    setLoading(false);

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
          Nuevo Cliente
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
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
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            placeholder="Dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
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

        {/* BOTONES */}
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
            onClick={crearCliente}
            disabled={loading}
            className="
              px-5 py-3
              rounded-2xl
              bg-blue-500
              hover:bg-blue-600
              transition
              font-semibold
            "
          >

            {loading ? "Guardando..." : "Guardar Cliente"}

          </button>

        </div>

      </div>

    </div>
  );
}