"use client";
export const dynamic = "force-dynamic";

import { Edit, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import DashboardLayout from "@/components/DashboardLayout";
import VehiculoFormModal from "@/components/VehiculoFormModal";
import { supabase } from "@/lib/supabase";

type Vehiculo = {
  id: number;
  cliente_id?: number | null;
  marca: string;
  modelo: string;
  patente: string;
  clientes?: {
    nombre?: string | null;
  } | null;
};

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [vehiculoEditar, setVehiculoEditar] = useState<Vehiculo | null>(null);
  const [vehiculoEliminar, setVehiculoEliminar] = useState<Vehiculo | null>(null);
  const [busqueda, setBusqueda] = useState("");

  async function obtenerVehiculos() {
    const { data, error } = await supabase
      .from("vehiculos")
      .select(
        `
        *,
        clientes (
          nombre
        )
      `
      )
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setVehiculos((data || []) as Vehiculo[]);
  }

  async function eliminarVehiculo(id: number) {
    const { error } = await supabase.from("vehiculos").delete().eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setVehiculoEliminar(null);
    obtenerVehiculos();
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      obtenerVehiculos();
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const vehiculosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return vehiculos;
    }

    return vehiculos.filter((vehiculo) =>
      [
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.patente,
        vehiculo.clientes?.nombre || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(texto)
    );
  }, [busqueda, vehiculos]);

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-5xl">Vehiculos</h1>
          <p className="mt-2 text-sm text-zinc-400 md:text-base">
            Gestion de vehiculos del taller
          </p>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-semibold transition hover:bg-blue-600 md:w-auto"
        >
          <Plus size={20} />
          Nuevo vehiculo
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar marca, modelo, patente o cliente..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none md:px-5 md:py-4"
        />
      </div>

      <div className="space-y-3 md:hidden">
        {vehiculosFiltrados.map((vehiculo) => (
          <article
            key={vehiculo.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/vehiculos/${vehiculo.id}`}
                  className="font-semibold text-blue-400 hover:underline"
                >
                  {vehiculo.patente}
                </Link>
                <p className="text-sm text-zinc-400">
                  {vehiculo.marca} {vehiculo.modelo}
                </p>
              </div>
              <p className="text-sm text-zinc-400">
                {vehiculo.clientes?.nombre || "-"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setVehiculoEditar(vehiculo)}
                className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500/20 px-3 py-2 text-sm font-semibold text-yellow-400"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={() => setVehiculoEliminar(vehiculo)}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-400"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="p-4 text-left md:p-6">Marca</th>
                <th className="p-4 text-left md:p-6">Modelo</th>
                <th className="p-4 text-left md:p-6">Patente</th>
                <th className="p-4 text-left md:p-6">Cliente</th>
                <th className="p-4 text-left md:p-6">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {vehiculosFiltrados.map((vehiculo) => (
                <tr
                  key={vehiculo.id}
                  className="border-b border-zinc-800 transition hover:bg-zinc-800/40"
                >
                  <td className="p-4 font-semibold md:p-6">{vehiculo.marca}</td>
                  <td className="p-4 md:p-6">{vehiculo.modelo}</td>
                  <td className="p-4 font-semibold text-blue-400 md:p-6">
                    <Link href={`/vehiculos/${vehiculo.id}`} className="hover:underline">
                      {vehiculo.patente}
                    </Link>
                  </td>
                  <td className="p-4 md:p-6">{vehiculo.clientes?.nombre || "-"}</td>
                  <td className="p-4 md:p-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setVehiculoEditar(vehiculo)}
                        className="rounded-xl bg-yellow-500/20 p-2 text-yellow-400 transition hover:bg-yellow-500/30"
                        title="Editar vehiculo"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setVehiculoEliminar(vehiculo)}
                        className="rounded-xl bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                        title="Eliminar vehiculo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {mostrarModal && (
        <VehiculoFormModal
          onClose={() => setMostrarModal(false)}
          onSuccess={obtenerVehiculos}
        />
      )}

      {vehiculoEditar && (
        <VehiculoFormModal
          vehiculo={vehiculoEditar}
          onClose={() => setVehiculoEditar(null)}
          onSuccess={obtenerVehiculos}
        />
      )}

      {vehiculoEliminar && (
        <ConfirmDeleteModal
          title="Eliminar vehiculo"
          message={`Vas a eliminar ${vehiculoEliminar.patente}. Esta accion no se puede deshacer.`}
          onClose={() => setVehiculoEliminar(null)}
          onConfirm={() => eliminarVehiculo(vehiculoEliminar.id)}
        />
      )}
    </DashboardLayout>
  );
}
