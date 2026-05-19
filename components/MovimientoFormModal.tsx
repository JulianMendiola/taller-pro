"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase";

type Movimiento = {
  id: number;
  tipo: string;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
};

type Props = {
  movimiento?: Movimiento | null;
  onClose: () => void;
  onSuccess: () => void;
};

function fechaLocalISO(fecha = new Date()) {
  const offset = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

export default function MovimientoFormModal({
  movimiento,
  onClose,
  onSuccess,
}: Props) {
  const [tipo, setTipo] = useState(movimiento?.tipo || "Salida");
  const [categoria, setCategoria] = useState(movimiento?.categoria || "");
  const [descripcion, setDescripcion] = useState(movimiento?.descripcion || "");
  const [monto, setMonto] = useState(
    movimiento?.monto ? String(movimiento.monto) : ""
  );
  const [fecha, setFecha] = useState(
    movimiento?.fecha?.slice(0, 10) || fechaLocalISO()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function guardarMovimiento() {
    if (!categoria.trim() || !descripcion.trim() || !monto || !fecha) {
      setError("Completa categoria, descripcion, monto y fecha.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      tipo,
      categoria: categoria.trim(),
      descripcion: descripcion.trim(),
      monto: Number(monto),
      fecha,
    };

    const result = movimiento
      ? await supabase
          .from("movimientos_financieros")
          .update(payload)
          .eq("id", movimiento.id)
      : await supabase.from("movimientos_financieros").insert(payload);

    setLoading(false);

    if (result.error) {
      console.error(result.error);
      setError("No se pudo guardar el movimiento.");
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold md:text-3xl">
            {movimiento ? "Editar movimiento" : "Nuevo movimiento"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Registra un ingreso o gasto con fecha propia.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Tipo</label>
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            >
              <option value="Entrada">Entrada</option>
              <option value="Salida">Salida</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-400">Categoria</label>
            <input
              type="text"
              value={categoria}
              onChange={(event) => setCategoria(event.target.value)}
              placeholder="Ej: IVA, repuestos, alquiler"
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400">Descripcion</label>
            <input
              type="text"
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              placeholder="Detalle del movimiento"
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-zinc-400">Monto</label>
              <input
                type="number"
                value={monto}
                onChange={(event) => setMonto(event.target.value)}
                placeholder="100000"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
              />
            </div>
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
            onClick={guardarMovimiento}
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
