"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
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

function nombreCliente(vehiculo: VehiculoOption): string {
  if (!vehiculo.clientes) return "";
  const c = Array.isArray(vehiculo.clientes)
    ? vehiculo.clientes[0]
    : vehiculo.clientes;
  return c?.nombre ? ` — ${c.nombre}` : "";
}

function etiquetaVehiculo(vehiculo: VehiculoOption): string {
  return `${vehiculo.patente} · ${vehiculo.marca} ${vehiculo.modelo}${nombreCliente(vehiculo)}`;
}

export default function OrdenFormModal({ orden, onClose, onSuccess }: Props) {
  const [vehiculos, setVehiculos] = useState<VehiculoOption[]>([]);
  const [vehiculoId, setVehiculoId] = useState(
    orden?.vehiculo_id ? String(orden.vehiculo_id) : ""
  );
  const [busqueda, setBusqueda] = useState("");
  const [descripcion, setDescripcion] = useState(orden?.descripcion || "");
  const [estado, setEstado] = useState(orden?.estado || "Pendiente");
  const [fecha, setFecha] = useState(orden?.fecha?.slice(0, 10) || fechaLocalISO());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const vehiculoSeleccionado = vehiculos.find((v) => String(v.id) === vehiculoId);

  const vehiculosFiltrados = vehiculos.filter((v) => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return true;
    return etiquetaVehiculo(v).toLowerCase().includes(texto);
  });

  async function obtenerVehiculos() {
    const { data, error } = await supabase
      .from("vehiculos")
      .select(`id, patente, marca, modelo, clientes(nombre)`)
      .order("patente", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setVehiculos((data || []) as VehiculoOption[]);
  }

  function seleccionarVehiculo(vehiculo: VehiculoOption) {
    setVehiculoId(String(vehiculo.id));
    setBusqueda("");
  }

  function limpiarSeleccion() {
    setVehiculoId("");
    setBusqueda("");
  }

  async function guardarOrden() {
    if (!vehiculoId || !descripcion.trim() || !estado || !fecha) {
      setError("Completá vehículo, trabajo, estado y fecha.");
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
    const frame = requestAnimationFrame(() => obtenerVehiculos());
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
            Registra el trabajo, el vehículo y el estado actual.
          </p>
        </div>

        <div className="space-y-4">

          {/* SELECTOR DE VEHÍCULO */}
          <div>
            <label className="text-sm text-zinc-400">Vehículo</label>

            {vehiculoSeleccionado ? (
              /* Vehículo ya elegido — mostrar chip con X para cambiar */
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-blue-500/40 bg-zinc-900 px-4 py-3">
                <span className="flex-1 text-sm">
                  <span className="font-bold text-blue-400">
                    {vehiculoSeleccionado.patente}
                  </span>
                  <span className="text-zinc-300">
                    {" · "}{vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}
                  </span>
                  {nombreCliente(vehiculoSeleccionado) && (
                    <span className="text-zinc-500">
                      {nombreCliente(vehiculoSeleccionado)}
                    </span>
                  )}
                </span>
                <button
                  onClick={limpiarSeleccion}
                  className="shrink-0 text-zinc-500 hover:text-white transition"
                  title="Cambiar vehículo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              /* Buscador + lista siempre visible */
              <div className="mt-2">
                {/* Input */}
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                  <Search size={16} className="shrink-0 text-zinc-500" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Escribí la patente o el auto..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500"
                    autoFocus
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda("")}
                      className="shrink-0 text-zinc-500 hover:text-white transition"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Lista filtrada — siempre visible */}
                <div className="mt-2 max-h-52 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900">
                  {vehiculosFiltrados.length === 0 ? (
                    <p className="p-4 text-center text-sm text-zinc-500">
                      No se encontró ningún vehículo
                    </p>
                  ) : (
                    vehiculosFiltrados.map((vehiculo) => (
                      <button
                        key={vehiculo.id}
                        onClick={() => seleccionarVehiculo(vehiculo)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-zinc-800 border-b border-zinc-800/60 last:border-0"
                      >
                        <span className="w-20 shrink-0 font-bold text-blue-400">
                          {vehiculo.patente}
                        </span>
                        <span className="text-zinc-300">
                          {vehiculo.marca} {vehiculo.modelo}
                          {nombreCliente(vehiculo) && (
                            <span className="text-zinc-500">
                              {nombreCliente(vehiculo)}
                            </span>
                          )}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TRABAJO */}
          <div>
            <label className="text-sm text-zinc-400">Trabajo</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Cambio de aceite, revisión de frenos..."
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
            />
          </div>

          {/* ESTADO Y FECHA */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-zinc-400">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 outline-none"
              >
                {estados.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
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
