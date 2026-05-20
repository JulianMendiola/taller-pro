"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import MovimientoFormModal from "@/components/MovimientoFormModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { supabase } from "@/lib/supabase";

interface Movimiento {
  id: number;
  tipo: string;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

function fechaLocalISO(fecha = new Date()) {
  const offset = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

function formatearFecha(valor: string) {
  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : valor;
}

export default function CajaPage() {
  const hoy = fechaLocalISO();

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [movimientoEditar, setMovimientoEditar] = useState<Movimiento | null>(null);
  const [movimientoEliminar, setMovimientoEliminar] = useState<Movimiento | null>(null);

  useEffect(() => {
    obtenerMovimientos();
  }, []);

  async function obtenerMovimientos() {
    const { data, error } = await supabase
      .from("movimientos_financieros")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setMovimientos(data || []);
  }

  async function eliminarMovimiento(id: number) {
    const { error } = await supabase
      .from("movimientos_financieros")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setMovimientoEliminar(null);
    obtenerMovimientos();
  }

  const movimientosDia = useMemo(() => {
    return movimientos.filter(
      (m) => m.fecha.slice(0, 10) === fechaSeleccionada
    );
  }, [movimientos, fechaSeleccionada]);

  const { ingresos, egresos } = useMemo(() => {
    const ing = movimientosDia
      .filter((m) => m.tipo === "Entrada")
      .reduce((acc, m) => acc + Number(m.monto), 0);
    const egr = movimientosDia
      .filter((m) => m.tipo === "Salida")
      .reduce((acc, m) => acc + Number(m.monto), 0);
    return { ingresos: ing, egresos: egr };
  }, [movimientosDia]);

  const balance = ingresos - egresos;
  const esHoy = fechaSeleccionada === hoy;

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold">Caja</h1>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            Movimientos del día
          </p>
        </div>

        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-semibold transition hover:bg-blue-600"
        >
          <Plus size={20} />
          Nuevo movimiento
        </button>
      </div>

      {/* SELECTOR DE FECHA */}
      <div className="mb-6 flex items-center gap-3">
        <input
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none text-sm"
        />
        {!esHoy && (
          <button
            onClick={() => setFechaSeleccionada(hoy)}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-400 transition hover:text-white"
          >
            Hoy
          </button>
        )}
        <span className="text-zinc-500 text-sm">
          {formatearFecha(fechaSeleccionada)}
          {esHoy && " (hoy)"}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-1 text-sm">Cobros del día</p>
          <h2 className="text-3xl md:text-4xl font-bold text-green-400">
            ${ingresos.toLocaleString("es-AR")}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-1 text-sm">Gastos del día</p>
          <h2 className="text-3xl md:text-4xl font-bold text-red-400">
            ${egresos.toLocaleString("es-AR")}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-1 text-sm">Balance del día</p>
          <h2
            className={`text-3xl md:text-4xl font-bold ${
              balance >= 0 ? "text-blue-400" : "text-red-400"
            }`}
          >
            ${balance.toLocaleString("es-AR")}
          </h2>
        </div>
      </div>

      {/* MOVIMIENTOS — MOBILE */}
      <div className="space-y-3 md:hidden">
        {movimientosDia.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
            Sin movimientos para este día.
          </div>
        )}

        {movimientosDia.map((m) => (
          <article
            key={m.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{m.descripcion}</p>
                <p className="text-sm text-zinc-400">{m.categoria}</p>
              </div>
              <span
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  m.tipo === "Entrada"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {m.tipo}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                ${Number(m.monto).toLocaleString("es-AR")}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setMovimientoEditar(m)}
                className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500/20 px-3 py-2 text-sm font-semibold text-yellow-400"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={() => setMovimientoEliminar(m)}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-400"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* MOVIMIENTOS — DESKTOP */}
      <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-xl font-bold">
            Movimientos —{" "}
            <span className="text-zinc-400 font-normal">
              {formatearFecha(fechaSeleccionada)}
              {esHoy && " (hoy)"}
            </span>
          </h2>
        </div>

        {movimientosDia.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Sin movimientos para este día.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="p-5 text-left">Tipo</th>
                  <th className="p-5 text-left">Categoría</th>
                  <th className="p-5 text-left">Descripción</th>
                  <th className="p-5 text-left">Monto</th>
                  <th className="p-5 text-left">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {movimientosDia.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-zinc-800 transition hover:bg-zinc-800/40"
                  >
                    <td className="p-5">
                      <span
                        className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                          m.tipo === "Entrada"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {m.tipo}
                      </span>
                    </td>
                    <td className="p-5 text-zinc-300">{m.categoria}</td>
                    <td className="p-5 font-semibold">{m.descripcion}</td>
                    <td className="p-5 font-bold text-lg">
                      ${Number(m.monto).toLocaleString("es-AR")}
                    </td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMovimientoEditar(m)}
                          className="rounded-xl bg-yellow-500/20 p-2 text-yellow-400 transition hover:bg-yellow-500/30"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setMovimientoEliminar(m)}
                          className="rounded-xl bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                          title="Eliminar"
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
        )}
      </div>

      {mostrarModal && (
        <MovimientoFormModal
          onClose={() => setMostrarModal(false)}
          onSuccess={obtenerMovimientos}
        />
      )}

      {movimientoEditar && (
        <MovimientoFormModal
          movimiento={movimientoEditar}
          onClose={() => setMovimientoEditar(null)}
          onSuccess={obtenerMovimientos}
        />
      )}

      {movimientoEliminar && (
        <ConfirmDeleteModal
          title="Eliminar movimiento"
          message={`Vas a eliminar "${movimientoEliminar.descripcion}". Esta acción no se puede deshacer.`}
          onClose={() => setMovimientoEliminar(null)}
          onConfirm={() => eliminarMovimiento(movimientoEliminar.id)}
        />
      )}
    </DashboardLayout>
  );
}
