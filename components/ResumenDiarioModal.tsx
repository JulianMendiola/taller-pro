"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ResumenDia = {
  id: number;
  fecha: string;
  ingreso: number;
  egreso: number;
};

type Props = {
  resumen?: ResumenDia | null;
  onClose: () => void;
  onSuccess: () => void;
};

function fechaLocalISO(fecha = new Date()) {
  const offset = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

export default function ResumenDiarioModal({ resumen, onClose, onSuccess }: Props) {
  const [fecha, setFecha] = useState(resumen?.fecha?.slice(0, 10) || fechaLocalISO());
  const [ingreso, setIngreso] = useState(resumen?.ingreso ? String(resumen.ingreso) : "");
  const [egreso, setEgreso] = useState(resumen?.egreso ? String(resumen.egreso) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    if (!fecha || (!ingreso && !egreso)) {
      setError("Completá la fecha y al menos un monto.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      fecha,
      ingreso: Number(ingreso) || 0,
      egreso: Number(egreso) || 0,
    };

    const result = resumen
      ? await supabase.from("resumen_diario").update(payload).eq("id", resumen.id)
      : await supabase.from("resumen_diario").insert(payload);

    setLoading(false);

    if (result.error) {
      console.error(result.error);
      if (result.error.code === "23505") {
        setError("Ya existe un registro para esa fecha. Editalo desde la lista.");
      } else {
        setError(`Error: ${result.error.message}`);
      }
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {resumen ? "Editar día" : "Cargar día"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Ingresá el total que entró y el total que salió.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Total que entró $</label>
            <input
              type="number"
              value={ingreso}
              onChange={(e) => setIngreso(e.target.value)}
              placeholder="Ej: 150000"
              inputMode="numeric"
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Total que salió $</label>
            <input
              type="number"
              value={egreso}
              onChange={(e) => setEgreso(e.target.value)}
              placeholder="Ej: 40000"
              inputMode="numeric"
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-8 flex flex-col justify-end gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="rounded-2xl bg-zinc-800 px-5 py-3 transition hover:bg-zinc-700"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={loading}
            className="rounded-2xl bg-blue-500 px-5 py-3 font-semibold transition hover:bg-blue-600 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
