"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type Orden = {
  id: number;
  descripcion: string;
  estado: string;
  fecha: string;
  vehiculo_id: number;
};

type VehiculoOption = {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  clientes?: {
    nombre: string;
  } | {
    nombre: string;
  }[] | null;
};

type Props = {
  orden?: Orden | null;
  onClose: () => void;
  onSuccess: () => void;
};

const estados = ["Pendiente", "En proceso", "Finalizado"];

function fechaLocalISO(fecha = new Date()) {
  const offset = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

export default function OrdenFormModal({ orden, onClose, onSuccess }: Props) {
  const [vehiculos, setVehiculos] = useState<VehiculoOption[]>([]);
  const [vehiculoId, setVehiculoId] = useState(
    orden?.vehiculo_id ? String(orden.vehiculo_id) : ""
  );
  const [descripcion, setDescripcion] = useState(orden?.descripcion || "");
  const [estado, setEstado] = useState(orden?.estado || "Pendiente");
  const [fecha, setFecha] = useState(orden?.fecha?.slice(0, 10) || fechaLocalISO());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function obtenerVehiculos() {
    const { data, error } = await supabase
      .from("vehiculos")
      .select(
        `
        id,
        patente,
        marca,
        modelo,
        clientes (
          nombre
        )
      `
      )
      .order("patente", { ascending: true });

    if (error) {
      console.error(error);
      setError("No se pudieron cargar los vehiculos.");
      return;
    }

    setVehiculos((data || []) as VehiculoOption[]);
  }

  async function guardarOrden() {
    if (!vehiculoId || !descripcion.trim() || !estado || !fecha) {
      setError("Completa vehiculo, trabajo, estado y fecha.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      vehiculo_id: Number(vehiculoId),
      descripcion: descripcion.trim(),
      estado,
      fecha,
    };

    const result = orden
      ? await supabase.from("ordenes_trabajo").update(payload).eq("id", orden.id)
      : await supabase.from("ordenes_trabajo").insert(payload);

    setLoading(false);

    if (result.error) {
      console.error(result.error);
      setError("No se pudo guardar la orden.");
      return;
    }

    onSuccess();
    onClose();
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      obtenerVehiculos();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold md:text-3xl">
            {orden ? "Editar orden" : "Nueva orden"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Registra el trabajo, el vehiculo y el estado actual.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Vehiculo</label>
            <select
              value={vehiculoId}
              onChange={(event) => setVehiculoId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            >
              <option value="">Seleccionar vehiculo</option>
              {vehiculos.map((vehiculo) => (
                <option key={vehiculo.id} value={vehiculo.id}>
                  {vehiculo.patente} - {vehiculo.marca} {vehiculo.modelo}
                  {Array.isArray(vehiculo.clientes)
                    ? vehiculo.clientes[0]?.nombre
                      ? ` - ${vehiculo.clientes[0].nombre}`
                      : ""
                    : vehiculo.clientes?.nombre
                      ? ` - ${vehiculo.clientes.nombre}`
                      : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-400">Trabajo</label>
            <textarea
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              placeholder="Ej: Cambio de aceite, revision de frenos..."
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-zinc-400">Estado</label>
              <select
                value={estado}
                onChange={(event) => setEstado(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
              >
                {estados.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
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
            onClick={guardarOrden}
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
