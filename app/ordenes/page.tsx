"use client";
export const dynamic = "force-dynamic";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import DashboardLayout from "@/components/DashboardLayout";
import OrdenFormModal from "@/components/OrdenFormModal";
import { supabase } from "@/lib/supabase";

type Orden = {
  id: number;
  descripcion: string;
  estado: string;
  fecha: string;
  vehiculo_id: number;
  patente: string;
  marca: string;
  modelo: string;
  cliente: string;
  telefono: string;
};

type OrdenRow = {
  id: number;
  descripcion: string;
  estado: string;
  fecha: string;
  vehiculo_id: number;
  vehiculos?: VehiculoRelacion | VehiculoRelacion[] | null;
};

type VehiculoRelacion = {
  patente?: string | null;
  marca?: string | null;
  modelo?: string | null;
  clientes?: ClienteRelacion | ClienteRelacion[] | null;
};

type ClienteRelacion = {
  nombre?: string | null;
  telefono?: string | null;
};

const estadoStyles: Record<string, string> = {
  Finalizado: "bg-green-500/20 text-green-400",
  "En proceso": "bg-yellow-500/20 text-yellow-400",
  Pendiente: "bg-red-500/20 text-red-400",
};

function formatearFecha(valor?: string) {
  if (!valor) {
    return "-";
  }

  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : valor;
}

function primero<T>(valor: T | T[] | null | undefined): T | null {
  if (Array.isArray(valor)) {
    return valor[0] || null;
  }

  return valor || null;
}

export default function OrdenesPage() {
  const router = useRouter();

  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ordenEditar, setOrdenEditar] = useState<Orden | null>(null);
  const [ordenEliminar, setOrdenEliminar] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);

  async function verificarSesion() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    obtenerOrdenes();
  }

  async function obtenerOrdenes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("ordenes_trabajo")
      .select(
        `
        id,
        descripcion,
        estado,
        fecha,
        vehiculo_id,
        vehiculos (
          patente,
          marca,
          modelo,
          clientes (
            nombre,
            telefono
          )
        )
      `
      )
      .order("fecha", { ascending: false })
      .order("id", { ascending: false });

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    const ordenesTransformadas = ((data || []) as OrdenRow[]).map((orden) => {
      const vehiculo = primero(orden.vehiculos);
      const cliente = primero(vehiculo?.clientes);

      return {
        id: orden.id,
        descripcion: orden.descripcion,
        estado: orden.estado || "Pendiente",
        fecha: orden.fecha,
        vehiculo_id: orden.vehiculo_id,
        patente: vehiculo?.patente || "-",
        marca: vehiculo?.marca || "-",
        modelo: vehiculo?.modelo || "-",
        cliente: cliente?.nombre || "-",
        telefono: cliente?.telefono || "-",
      };
    });

    setOrdenes(ordenesTransformadas);
  }

  async function eliminarOrden(id: number) {
    const { error } = await supabase.from("ordenes_trabajo").delete().eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setOrdenEliminar(null);
    obtenerOrdenes();
  }

  useEffect(() => {
    verificarSesion();
  }, []);

  const ordenesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return ordenes;
    }

    return ordenes.filter((orden) =>
      [
        orden.patente,
        orden.marca,
        orden.modelo,
        orden.cliente,
        orden.telefono,
        orden.descripcion,
        orden.estado,
      ]
        .join(" ")
        .toLowerCase()
        .includes(texto)
    );
  }, [busqueda, ordenes]);

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-5xl">Ordenes de trabajo</h1>
          <p className="mt-2 text-sm text-zinc-400 md:text-base">
            Gestion de trabajos, estados y seguimiento por vehiculo.
          </p>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-semibold transition hover:bg-blue-600 md:w-auto"
        >
          <Plus size={20} />
          Nueva orden
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar patente, cliente, telefono, trabajo o estado..."
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none md:px-5 md:py-4"
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">Total</p>
          <p className="text-2xl font-bold">{ordenes.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">En proceso</p>
          <p className="text-2xl font-bold text-yellow-400">
            {ordenes.filter((orden) => orden.estado === "En proceso").length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">Finalizadas</p>
          <p className="text-2xl font-bold text-green-400">
            {ordenes.filter((orden) => orden.estado === "Finalizado").length}
          </p>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {ordenesFiltradas.map((orden) => (
          <article
            key={orden.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-blue-400">{orden.patente}</p>
                <p className="text-sm text-zinc-400">
                  {orden.marca} {orden.modelo}
                </p>
              </div>
              <span
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  estadoStyles[orden.estado] || estadoStyles.Pendiente
                }`}
              >
                {orden.estado}
              </span>
            </div>

            <p className="font-semibold">{orden.descripcion}</p>
            <p className="mt-2 text-sm text-zinc-400">
              {orden.cliente} - {orden.telefono}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Fecha: {formatearFecha(orden.fecha)}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrdenEditar(orden)}
                className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500/20 px-3 py-2 text-sm font-semibold text-yellow-400"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={() => setOrdenEliminar(orden)}
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
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="p-4 text-left md:p-6">Vehiculo</th>
                <th className="p-4 text-left md:p-6">Cliente</th>
                <th className="p-4 text-left md:p-6">Telefono</th>
                <th className="p-4 text-left md:p-6">Trabajo</th>
                <th className="p-4 text-left md:p-6">Fecha</th>
                <th className="p-4 text-left md:p-6">Estado</th>
                <th className="p-4 text-left md:p-6">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ordenesFiltradas.map((orden) => (
                <tr
                  key={orden.id}
                  className="border-b border-zinc-800 transition hover:bg-zinc-800/40"
                >
                  <td className="p-4 md:p-6">
                    <div className="font-semibold text-blue-400">{orden.patente}</div>
                    <div className="text-sm text-zinc-400">
                      {orden.marca} {orden.modelo}
                    </div>
                  </td>
                  <td className="p-4 md:p-6">{orden.cliente}</td>
                  <td className="p-4 md:p-6">{orden.telefono}</td>
                  <td className="p-4 font-semibold md:p-6">{orden.descripcion}</td>
                  <td className="p-4 md:p-6">{formatearFecha(orden.fecha)}</td>
                  <td className="p-4 md:p-6">
                    <span
                      className={`rounded-xl px-3 py-2 text-xs font-semibold md:text-sm ${
                        estadoStyles[orden.estado] || estadoStyles.Pendiente
                      }`}
                    >
                      {orden.estado}
                    </span>
                  </td>
                  <td className="p-4 md:p-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setOrdenEditar(orden)}
                        className="rounded-xl bg-yellow-500/20 p-2 text-yellow-400 transition hover:bg-yellow-500/30"
                        title="Editar orden"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setOrdenEliminar(orden)}
                        className="rounded-xl bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                        title="Eliminar orden"
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

      {!loading && ordenesFiltradas.length === 0 && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-center text-zinc-400">
          No hay ordenes para mostrar.
        </div>
      )}

      {mostrarModal && (
        <OrdenFormModal
          onClose={() => setMostrarModal(false)}
          onSuccess={obtenerOrdenes}
        />
      )}

      {ordenEditar && (
        <OrdenFormModal
          orden={ordenEditar}
          onClose={() => setOrdenEditar(null)}
          onSuccess={obtenerOrdenes}
        />
      )}

      {ordenEliminar && (
        <ConfirmDeleteModal
          title="Eliminar orden"
          message={`Vas a eliminar la orden de ${ordenEliminar.patente}. Esta accion no se puede deshacer.`}
          onClose={() => setOrdenEliminar(null)}
          onConfirm={() => eliminarOrden(ordenEliminar.id)}
        />
      )}
    </DashboardLayout>
  );
}
