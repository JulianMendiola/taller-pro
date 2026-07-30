"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: number;
  nombre: string;
};

type Vehiculo = {
  id: number;
  cliente_id?: number | null;
  marca: string;
  modelo: string;
  patente: string;
  telefono?: string | null;
  fecha?: string | null;
};

type Props = {
  vehiculo?: Vehiculo | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function VehiculoFormModal({ vehiculo, onClose, onSuccess }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState(
    vehiculo?.cliente_id ? String(vehiculo.cliente_id) : ""
  );
  const [marca, setMarca] = useState(vehiculo?.marca || "");
  const [modelo, setModelo] = useState(vehiculo?.modelo || "");
  const [patente, setPatente] = useState(vehiculo?.patente || "");
  const [telefono, setTelefono] = useState(vehiculo?.telefono || "");
  const [fecha, setFecha] = useState(vehiculo?.fecha?.slice(0, 10) || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function obtenerClientes() {
    const { data } = await supabase
      .from("clientes")
      .select("id, nombre")
      .order("nombre", { ascending: true });

    setClientes(data || []);
  }

  async function guardarVehiculo() {
    if (!patente.trim()) {
      setError("La patente es obligatoria.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      cliente_id: clienteId ? Number(clienteId) : null,
      marca: marca.trim(),
      modelo: modelo.trim(),
      patente: patente.trim().toUpperCase(),
      telefono: telefono.trim() || null,
      fecha: fecha || null,
    };

    const result = vehiculo
      ? await supabase.from("vehiculos").update(payload).eq("id", vehiculo.id)
      : await supabase.from("vehiculos").insert(payload);

    setLoading(false);

    if (result.error) {
      console.error(result.error);
      // Código 23505 = unique constraint violation (patente duplicada)
      if (result.error.code === "23505") {
        setError(`La patente ${patente.trim().toUpperCase()} ya está registrada.`);
      } else {
        setError(`Error: ${result.error.message}`);
      }
      return;
    }

    onSuccess();
    onClose();
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => obtenerClientes());
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold md:text-3xl">
            {vehiculo ? "Editar vehículo" : "Nuevo vehículo"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            La patente y el teléfono son lo más importante.
          </p>
        </div>

        <div className="space-y-4">
          {/* PATENTE */}
          <div>
            <label className="text-sm text-zinc-400">Patente</label>
            <input
              type="text"
              value={patente}
              onChange={(e) => setPatente(e.target.value)}
              placeholder="Ej: ABC123"
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 uppercase outline-none"
            />
          </div>

          {/* MARCA Y MODELO */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-zinc-400">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Ford"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400">Modelo</label>
              <input
                type="text"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej: Focus"
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
              />
            </div>
          </div>

          {/* TELÉFONO */}
          <div>
            <label className="text-sm text-zinc-400">
              Teléfono{" "}
              <span className="text-zinc-600">(para avisar por WhatsApp)</span>
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 5491112345678"
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>

          {/* FECHA */}
          <div>
            <label className="text-sm text-zinc-400">Fecha de ingreso</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>

          {/* CLIENTE OPCIONAL */}
          <div>
            <label className="text-sm text-zinc-400">
              Cliente{" "}
              <span className="text-zinc-600">(opcional)</span>
            </label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            >
              <option value="">Sin cliente asignado</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
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
            onClick={guardarVehiculo}
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
