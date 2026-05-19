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
};

type Props = {
  vehiculo?: Vehiculo | null;
  onClose: () => void;
  onSuccess: () => void;
};

export default function VehiculoFormModal({
  vehiculo,
  onClose,
  onSuccess,
}: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState(
    vehiculo?.cliente_id ? String(vehiculo.cliente_id) : ""
  );
  const [marca, setMarca] = useState(vehiculo?.marca || "");
  const [modelo, setModelo] = useState(vehiculo?.modelo || "");
  const [patente, setPatente] = useState(vehiculo?.patente || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function obtenerClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nombre")
      .order("nombre", { ascending: true });

    if (error) {
      console.error(error);
      setError("No se pudieron cargar los clientes.");
      return;
    }

    setClientes(data || []);
  }

  async function guardarVehiculo() {
    if (!clienteId || !marca.trim() || !modelo.trim() || !patente.trim()) {
      setError("Completa cliente, marca, modelo y patente.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      cliente_id: Number(clienteId),
      marca: marca.trim(),
      modelo: modelo.trim(),
      patente: patente.trim().toUpperCase(),
    };

    const result = vehiculo
      ? await supabase.from("vehiculos").update(payload).eq("id", vehiculo.id)
      : await supabase.from("vehiculos").insert(payload);

    setLoading(false);

    if (result.error) {
      console.error(result.error);
      setError("No se pudo guardar el vehiculo.");
      return;
    }

    onSuccess();
    onClose();
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      obtenerClientes();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold md:text-3xl">
            {vehiculo ? "Editar vehiculo" : "Nuevo vehiculo"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Asocia el vehiculo a un cliente del taller.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Cliente</label>
            <select
              value={clienteId}
              onChange={(event) => setClienteId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-zinc-400">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(event) => setMarca(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">Modelo</label>
              <input
                type="text"
                value={modelo}
                onChange={(event) => setModelo(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-400">Patente</label>
            <input
              type="text"
              value={patente}
              onChange={(event) => setPatente(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 uppercase outline-none"
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
