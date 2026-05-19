"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit, Trash2 } from "lucide-react";

import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import DashboardLayout from "@/components/DashboardLayout";
import MovimientoFormModal from "@/components/MovimientoFormModal";
import { supabase } from "@/lib/supabase";

interface Movimiento {
  id: number;
  tipo: string;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

const meses = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

function fechaLocalISO(fecha = new Date()) {
  const offset = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

function partesFecha(valor: string) {
  const fecha = valor.slice(0, 10);
  const [anio = "", mes = "", dia = ""] = fecha.split("-");

  return { anio, mes, dia, fecha };
}

function formatearFecha(valor: string) {
  const { anio, mes, dia } = partesFecha(valor);

  if (!anio || !mes || !dia) {
    return "-";
  }

  return `${dia}/${mes}/${anio}`;
}

function escaparCsv(valor: string | number) {
  return `"${String(valor).replaceAll('"', '""')}"`;
}

export default function GastosPage() {
  const hoy = fechaLocalISO();
  const [anioActual, mesActual] = hoy.split("-");

  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);
  const [anioSeleccionado, setAnioSeleccionado] = useState(anioActual);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [movimientoEditar, setMovimientoEditar] = useState<Movimiento | null>(null);
  const [movimientoEliminar, setMovimientoEliminar] =
    useState<Movimiento | null>(null);

  useEffect(() => {
    obtenerMovimientos();
  }, []);

  const aniosDisponibles = useMemo(() => {
    const anios = new Set<string>([anioActual]);

    movimientos.forEach((movimiento) => {
      const { anio } = partesFecha(movimiento.fecha);

      if (anio) {
        anios.add(anio);
      }
    });

    return Array.from(anios).sort((a, b) => Number(b) - Number(a));
  }, [anioActual, movimientos]);

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((movimiento) => {
      const { anio, mes } = partesFecha(movimiento.fecha);

      return anio === anioSeleccionado && mes === mesSeleccionado;
    });
  }, [anioSeleccionado, mesSeleccionado, movimientos]);

  const { ingresos, egresos } = useMemo(() => {
    const totalIngresos = movimientosFiltrados
      .filter((movimiento) => movimiento.tipo === "Entrada")
      .reduce((acc, movimiento) => acc + Number(movimiento.monto), 0);

    const totalEgresos = movimientosFiltrados
      .filter((movimiento) => movimiento.tipo === "Salida")
      .reduce((acc, movimiento) => acc + Number(movimiento.monto), 0);

    return {
      ingresos: totalIngresos,
      egresos: totalEgresos,
    };
  }, [movimientosFiltrados]);

  async function obtenerMovimientos() {
    const { data, error } = await supabase
      .from("movimientos_financieros")
      .select("*")
      .order("fecha", { ascending: false });

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

  function exportarExcel() {
    if (movimientosFiltrados.length === 0) {
      alert("No hay movimientos para exportar en este mes.");
      return;
    }

    const encabezados = ["Tipo", "Categoria", "Descripcion", "Monto", "Fecha"];
    const filas = movimientosFiltrados.map((movimiento) => [
      movimiento.tipo,
      movimiento.categoria,
      movimiento.descripcion,
      Number(movimiento.monto),
      formatearFecha(movimiento.fecha),
    ]);

    const contenido = [encabezados, ...filas]
      .map((fila) => fila.map(escaparCsv).join(";"))
      .join("\n");

    const blob = new Blob([`\uFEFF${contenido}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `gastos-${anioSeleccionado}-${mesSeleccionado}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const balance = ingresos - egresos;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold">Gastos</h1>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            Control financiero mensual
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={exportarExcel}
            className="bg-zinc-800 hover:bg-zinc-700 transition px-5 py-3 rounded-2xl font-semibold"
          >
            Exportar Excel
          </button>

          <button
            onClick={() => setMostrarModal(true)}
            className="bg-blue-500 hover:bg-blue-600 transition px-5 py-3 rounded-2xl font-semibold"
          >
            + Nuevo Movimiento
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <select
          value={mesSeleccionado}
          onChange={(event) => setMesSeleccionado(event.target.value)}
          className="w-full md:w-auto bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none"
        >
          {meses.map((mes) => (
            <option key={mes.value} value={mes.value}>
              {mes.label}
            </option>
          ))}
        </select>

        <select
          value={anioSeleccionado}
          onChange={(event) => setAnioSeleccionado(event.target.value)}
          className="w-full md:w-auto bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none"
        >
          {aniosDisponibles.map((anio) => (
            <option key={anio} value={anio}>
              {anio}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-2 text-sm">Ingresos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-green-400">
            $ {ingresos.toLocaleString("es-AR")}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-2 text-sm">Gastos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-red-400">
            $ {egresos.toLocaleString("es-AR")}
          </h2>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8">
          <p className="text-zinc-400 mb-2 text-sm">Balance</p>
          <h2
            className={`text-3xl md:text-4xl font-bold ${
              balance >= 0 ? "text-blue-400" : "text-red-400"
            }`}
          >
            $ {balance.toLocaleString("es-AR")}
          </h2>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {movimientosFiltrados.map((movimiento) => (
          <article
            key={movimiento.id}
            className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{movimiento.descripcion}</p>
                <p className="text-sm text-zinc-400">{movimiento.categoria}</p>
              </div>
              <span
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  movimiento.tipo === "Entrada"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {movimiento.tipo}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zinc-400">{formatearFecha(movimiento.fecha)}</span>
              <span className="text-lg font-bold">
                $ {Number(movimiento.monto).toLocaleString("es-AR")}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setMovimientoEditar(movimiento)}
                className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500/20 px-3 py-2 text-sm font-semibold text-yellow-400"
              >
                <Edit size={16} />
                Editar
              </button>
              <button
                onClick={() => setMovimientoEliminar(movimiento)}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-400"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden md:block">
        <div className="p-5 border-b border-zinc-800">
          <h2 className="text-xl md:text-2xl font-bold">Movimientos del mes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="text-left p-4 md:p-6">Tipo</th>
                <th className="text-left p-4 md:p-6">Categoria</th>
                <th className="text-left p-4 md:p-6">Descripcion</th>
                <th className="text-left p-4 md:p-6">Monto</th>
                <th className="text-left p-4 md:p-6">Fecha</th>
                <th className="text-left p-4 md:p-6">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {movimientosFiltrados.map((movimiento) => (
                <tr
                  key={movimiento.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/40 transition"
                >
                  <td className="p-4 md:p-6">
                    <span
                      className={`px-3 py-2 rounded-xl text-xs md:text-sm font-semibold ${
                        movimiento.tipo === "Entrada"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {movimiento.tipo}
                    </span>
                  </td>
                  <td className="p-4 md:p-6">{movimiento.categoria}</td>
                  <td className="p-4 md:p-6">{movimiento.descripcion}</td>
                  <td className="p-4 md:p-6 font-semibold">
                    $ {Number(movimiento.monto).toLocaleString("es-AR")}
                  </td>
                  <td className="p-4 md:p-6">
                    {formatearFecha(movimiento.fecha)}
                  </td>
                  <td className="p-4 md:p-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMovimientoEditar(movimiento)}
                        className="rounded-xl bg-yellow-500/20 p-2 text-yellow-400 transition hover:bg-yellow-500/30"
                        title="Editar movimiento"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setMovimientoEliminar(movimiento)}
                        className="rounded-xl bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                        title="Eliminar movimiento"
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
          message={`Vas a eliminar "${movimientoEliminar.descripcion}". Esta accion no se puede deshacer.`}
          onClose={() => setMovimientoEliminar(null)}
          onConfirm={() => eliminarMovimiento(movimientoEliminar.id)}
        />
      )}
    </DashboardLayout>
  );
}
