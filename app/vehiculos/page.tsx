"use client";
export const dynamic = "force-dynamic";

import { Edit, MessageCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import DashboardLayout from "@/components/DashboardLayout";
import NuevoTrabajoModal from "@/components/NuevoTrabajoModal";
import VehiculoFormModal from "@/components/VehiculoFormModal";
import { supabase } from "@/lib/supabase";

type Trabajo = {
  id: number;
  descripcion: string;
  fecha: string;
};

type Vehiculo = {
  id: number;
  patente: string;
  modelo: string;
  telefono?: string | null;
  trabajos: Trabajo[];
};

type VehiculoRow = {
  id: number;
  patente: string;
  marca?: string | null;
  modelo: string;
  telefono?: string | null;
  clientes?: { telefono?: string | null } | { telefono?: string | null }[] | null;
  ordenes_trabajo?: { id: number; descripcion: string; fecha: string }[] | null;
};

function formatearFecha(valor?: string) {
  if (!valor) return "-";
  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : valor;
}

function generarWhatsApp(telefono: string): string {
  const tel = telefono.replace(/\D/g, "");
  return `https://wa.me/${tel}`;
}

export default function VehiculosPage() {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  const [mostrarModalVehiculo, setMostrarModalVehiculo] = useState(false);
  const [vehiculoEditar, setVehiculoEditar] = useState<Vehiculo | null>(null);
  const [vehiculoEliminar, setVehiculoEliminar] = useState<Vehiculo | null>(null);
  const [vehiculoTrabajo, setVehiculoTrabajo] = useState<Vehiculo | null>(null);
  const [trabajoEditar, setTrabajoEditar] = useState<{ trabajo: Trabajo; vehiculo: Vehiculo } | null>(null);
  const [trabajoEliminar, setTrabajoEliminar] = useState<{ id: number; patente: string } | null>(null);

  async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    obtenerVehiculos();
  }

  async function obtenerVehiculos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("vehiculos")
      .select(`
        id, patente, marca, modelo, telefono,
        clientes ( telefono ),
        ordenes_trabajo ( id, descripcion, fecha )
      `)
      .order("id", { ascending: false });

    setLoading(false);
    if (error) { console.error(error); return; }

    const transformados: Vehiculo[] = ((data || []) as VehiculoRow[]).map((v) => {
      const telCliente = Array.isArray(v.clientes) ? v.clientes[0]?.telefono : v.clientes?.telefono;
      const trabajos = (v.ordenes_trabajo || [])
        .slice()
        .sort((a, b) => b.fecha.localeCompare(a.fecha));

      return {
        id: v.id,
        patente: v.patente,
        modelo: v.modelo,
        telefono: v.telefono || telCliente || null,
        trabajos,
      };
    });

    setVehiculos(transformados);
  }

  async function eliminarTrabajo(id: number) {
    await supabase.from("ordenes_trabajo").delete().eq("id", id);
    setTrabajoEliminar(null);
    obtenerVehiculos();
  }

  async function eliminarVehiculo(id: number) {
    await supabase.from("vehiculos").delete().eq("id", id);
    setVehiculoEliminar(null);
    obtenerVehiculos();
  }

  useEffect(() => { verificarSesion(); }, []);

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return vehiculos;
    return vehiculos.filter((v) =>
      [v.patente, v.modelo, v.telefono || "", ...v.trabajos.map((t) => t.descripcion)]
        .join(" ").toLowerCase().includes(texto)
    );
  }, [busqueda, vehiculos]);

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-5xl">Vehículos y Trabajos</h1>
          <p className="mt-2 text-sm text-zinc-400 md:text-base">
            Todos los autos y los trabajos realizados en cada uno.
          </p>
        </div>
        <button
          onClick={() => setMostrarModalVehiculo(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-semibold transition hover:bg-blue-600 md:w-auto"
        >
          <Plus size={20} />
          Nuevo vehículo
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar patente, modelo, teléfono o trabajo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none md:px-5 md:py-4"
        />
      </div>

      {!loading && vehiculosFiltrados.length === 0 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-400">
          No hay vehículos para mostrar.
        </div>
      )}

      <div className="space-y-4">
        {vehiculosFiltrados.map((vehiculo) => (
          <div
            key={vehiculo.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 overflow-hidden"
          >
            {/* Cabecera del vehículo */}
            <div className="flex items-center gap-3 p-4 md:p-5">
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-blue-400">{vehiculo.patente}</p>
                <p className="text-sm text-zinc-300">{vehiculo.modelo}</p>
                {vehiculo.telefono && (
                  <p className="text-sm text-zinc-500 mt-0.5">{vehiculo.telefono}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {vehiculo.telefono && (
                  <a
                    href={generarWhatsApp(vehiculo.telefono)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-green-500/20 p-2 text-green-400 transition hover:bg-green-500/30"
                    title="WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </a>
                )}
                <button
                  onClick={() => setVehiculoEditar(vehiculo)}
                  className="rounded-xl bg-yellow-500/20 p-2 text-yellow-400 transition hover:bg-yellow-500/30"
                  title="Editar vehículo"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => setVehiculoEliminar(vehiculo)}
                  className="rounded-xl bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                  title="Eliminar vehículo"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Trabajos */}
            <div className="border-t border-zinc-800">
              {vehiculo.trabajos.length === 0 ? (
                <p className="px-4 py-3 text-sm text-zinc-600 md:px-5">Sin trabajos registrados.</p>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {vehiculo.trabajos.map((trabajo) => (
                    <div key={trabajo.id} className="flex items-start gap-3 px-4 py-3 md:px-5">
                      <span className="shrink-0 text-xs text-zinc-500 mt-0.5 w-20">
                        {formatearFecha(trabajo.fecha)}
                      </span>
                      <span className="flex-1 text-sm text-zinc-200">{trabajo.descripcion}</span>
                      <button
                        onClick={() => setTrabajoEditar({ trabajo, vehiculo })}
                        className="shrink-0 text-zinc-600 hover:text-yellow-400 transition"
                        title="Editar trabajo"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setTrabajoEliminar({ id: trabajo.id, patente: vehiculo.patente })}
                        className="shrink-0 text-zinc-600 hover:text-red-400 transition"
                        title="Eliminar trabajo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-3 md:px-5">
                <button
                  onClick={() => setVehiculoTrabajo(vehiculo)}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:border-blue-500 hover:text-blue-400"
                >
                  <Plus size={14} />
                  Agregar trabajo
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mostrarModalVehiculo && (
        <VehiculoFormModal
          onClose={() => setMostrarModalVehiculo(false)}
          onSuccess={obtenerVehiculos}
        />
      )}

      {vehiculoEditar && (
        <VehiculoFormModal
          vehiculo={vehiculoEditar as any}
          onClose={() => setVehiculoEditar(null)}
          onSuccess={obtenerVehiculos}
        />
      )}

      {vehiculoTrabajo && (
        <NuevoTrabajoModal
          vehiculoId={vehiculoTrabajo.id}
          patente={vehiculoTrabajo.patente}
          onClose={() => setVehiculoTrabajo(null)}
          onSuccess={obtenerVehiculos}
        />
      )}

      {trabajoEditar && (
        <NuevoTrabajoModal
          vehiculoId={trabajoEditar.vehiculo.id}
          patente={trabajoEditar.vehiculo.patente}
          trabajo={trabajoEditar.trabajo}
          onClose={() => setTrabajoEditar(null)}
          onSuccess={obtenerVehiculos}
        />
      )}

      {trabajoEliminar && (
        <ConfirmDeleteModal
          title="Eliminar trabajo"
          message={`Vas a eliminar este trabajo de ${trabajoEliminar.patente}. Esta acción no se puede deshacer.`}
          onClose={() => setTrabajoEliminar(null)}
          onConfirm={() => eliminarTrabajo(trabajoEliminar.id)}
        />
      )}

      {vehiculoEliminar && (
        <ConfirmDeleteModal
          title="Eliminar vehículo"
          message={`Vas a eliminar ${vehiculoEliminar.patente} y todos sus trabajos. Esta acción no se puede deshacer.`}
          onClose={() => setVehiculoEliminar(null)}
          onConfirm={() => eliminarVehiculo(vehiculoEliminar.id)}
        />
      )}
    </DashboardLayout>
  );
}
