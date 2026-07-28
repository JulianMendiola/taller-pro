"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Props = {
  vehiculoId: number;
  patente: string;
  onClose: () => void;
  onSuccess: () => void;
};

function fechaLocalISO(fecha = new Date()) {
  const offset = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

export default function NuevoTrabajoModal({ vehiculoId, patente, onClose, onSuccess }: Props) {
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(fechaLocalISO());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    if (!descripcion.trim()) {
      setError("Escribí el trabajo realizado.");
      return;
    }

    setLoading(true);
    setError("");

    const { error } = await supabase.from("ordenes_trabajo").insert({
      vehiculo_id: vehiculoId,
      descripcion: descripcion.trim(),
      estado: "Finalizado",
      fecha,
    });

    setLoading(false);

    if (error) {
      setError("No se pudo guardar el trabajo.");
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Nuevo trabajo</h2>
            <p className="text-sm text-zinc-400">{patente}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Trabajo realizado</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Cambio de aceite, revisión de frenos..."
              rows={4}
              autoFocus
              className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-zinc-800 py-3 transition hover:bg-zinc-700"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={loading}
            className="flex-1 rounded-2xl bg-blue-500 py-3 font-semibold transition hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
