"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import ResumenDiarioModal from "@/components/ResumenDiarioModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { supabase } from "@/lib/supabase";

type ResumenDia = {
  id: number;
  fecha: string;
  ingreso: number;
  egreso: number;
};

const MESES = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

function fechaLocalISO(fecha = new Date()) {
  const offset = fecha.getTimezoneOffset() * 60_000;
  return new Date(fecha.getTime() - offset).toISOString().slice(0, 10);
}

function formatearFecha(valor: string) {
  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : valor;
}

export default function CajaPage() {
  const hoy = new Date();

  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [resumenes, setResumenes] = useState<ResumenDia[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [diaEditar, setDiaEditar] = useState<ResumenDia | null>(null);
  const [diaEliminar, setDiaEliminar] = useState<ResumenDia | null>(null);

  useEffect(() => {
    obtenerResumenes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, anio]);

  async function obtenerResumenes() {
    const primerDia = `${anio}-${String(mes + 1).padStart(2, "0")}-01`;
    const ultimoDia = fechaLocalISO(new Date(anio, mes + 1, 0));

    const { data, error } = await supabase
      .from("resumen_diario")
      .select("*")
      .gte("fecha", primerDia)
      .lte("fecha", ultimoDia)
      .order("fecha", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setResumenes(data || []);
  }

  async function eliminarDia(id: number) {
    const { error } = await supabase.from("resumen_diario").delete().eq("id", id);
    if (error) { console.error(error); return; }
    setDiaEliminar(null);
    obtenerResumenes();
  }

  function cambiarMes(delta: number) {
    let nuevoMes = mes + delta;
    let nuevoAnio = anio;
    if (nuevoMes < 0) { nuevoMes = 11; nuevoAnio--; }
    if (nuevoMes > 11) { nuevoMes = 0; nuevoAnio++; }
    setMes(nuevoMes);
    setAnio(nuevoAnio);
  }

  const totalIngreso = useMemo(
    () => resumenes.reduce((acc, r) => acc + Number(r.ingreso), 0),
    [resumenes]
  );
  const totalEgreso = useMemo(
    () => resumenes.reduce((acc, r) => acc + Number(r.egreso), 0),
    [resumenes]
  );
  const ganancia = totalIngreso - totalEgreso;

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-5xl">Caja</h1>
          <p className="mt-2 text-sm text-zinc-400 md:text-base">
            Resumen diario de entradas y salidas
          </p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 font-semibold transition hover:bg-blue-600 md:w-auto"
        >
          <Plus size={20} />
          Cargar día
        </button>
      </div>

      {/* SELECTOR DE MES */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => cambiarMes(-1)}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-400 transition hover:text-white"
        >
          ←
        </button>
        <span className="min-w-[180px] text-center text-xl font-bold">
          {MESES[mes]} {anio}
        </span>
        <button
          onClick={() => cambiarMes(1)}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-400 transition hover:text-white"
        >
          →
        </button>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-1 text-sm text-zinc-400">Total entró</p>
          <p className="text-3xl font-bold text-green-400">
            ${totalIngreso.toLocaleString("es-AR")}
          </p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-1 text-sm text-zinc-400">Total salió</p>
          <p className="text-3xl font-bold text-red-400">
            ${totalEgreso.toLocaleString("es-AR")}
          </p>
        </div>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="mb-1 text-sm text-zinc-400">Ganancia del mes</p>
          <p className={`text-3xl font-bold ${ganancia >= 0 ? "text-blue-400" : "text-red-400"}`}>
            {ganancia >= 0 ? "+" : ""}${ganancia.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      {/* LISTA MOBILE */}
      <div className="space-y-3 md:hidden">
        {resumenes.length === 0 && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
            No hay registros para {MESES[mes].toLowerCase()}.
          </div>
        )}
        {resumenes.map((r) => {
          const gan = Number(r.ingreso) - Number(r.egreso);
          return (
            <article
              key={r.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-lg font-bold">{formatearFecha(r.fecha)}</p>
                <span className={`text-sm font-bold ${gan >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  {gan >= 0 ? "+" : ""}${gan.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-zinc-500">Entró</p>
                  <p className="font-semibold text-green-400">
                    ${Number(r.ingreso).toLocaleString("es-AR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Salió</p>
                  <p className="font-semibold text-red-400">
                    ${Number(r.egreso).toLocaleString("es-AR")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDiaEditar(r)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-yellow-500/20 px-3 py-2 text-sm font-semibold text-yellow-400"
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button
                  onClick={() => setDiaEliminar(r)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-sm font-semibold text-red-400"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* TABLA DESKTOP */}
      <div className="hidden overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 md:block">
        {resumenes.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            No hay registros para {MESES[mes].toLowerCase()}.
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="p-5 text-left">Fecha</th>
                <th className="p-5 text-left">Entró</th>
                <th className="p-5 text-left">Salió</th>
                <th className="p-5 text-left">Ganancia del día</th>
                <th className="p-5 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {resumenes.map((r) => {
                const gan = Number(r.ingreso) - Number(r.egreso);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-800 transition hover:bg-zinc-800/40"
                  >
                    <td className="p-5 font-semibold">{formatearFecha(r.fecha)}</td>
                    <td className="p-5 font-semibold text-green-400">
                      ${Number(r.ingreso).toLocaleString("es-AR")}
                    </td>
                    <td className="p-5 font-semibold text-red-400">
                      ${Number(r.egreso).toLocaleString("es-AR")}
                    </td>
                    <td className={`p-5 text-lg font-bold ${gan >= 0 ? "text-blue-400" : "text-red-400"}`}>
                      {gan >= 0 ? "+" : ""}${gan.toLocaleString("es-AR")}
                    </td>
                    <td className="p-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDiaEditar(r)}
                          className="rounded-xl bg-yellow-500/20 p-2 text-yellow-400 transition hover:bg-yellow-500/30"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDiaEliminar(r)}
                          className="rounded-xl bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {/* FILA TOTAL */}
              <tr className="bg-zinc-800/60 font-bold">
                <td className="p-5 text-zinc-400 uppercase tracking-wide text-sm">
                  Total {MESES[mes]}
                </td>
                <td className="p-5 text-green-400">
                  ${totalIngreso.toLocaleString("es-AR")}
                </td>
                <td className="p-5 text-red-400">
                  ${totalEgreso.toLocaleString("es-AR")}
                </td>
                <td className={`p-5 text-lg ${ganancia >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  {ganancia >= 0 ? "+" : ""}${ganancia.toLocaleString("es-AR")}
                </td>
                <td className="p-5" />
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {mostrarModal && (
        <ResumenDiarioModal
          onClose={() => setMostrarModal(false)}
          onSuccess={obtenerResumenes}
        />
      )}

      {diaEditar && (
        <ResumenDiarioModal
          resumen={diaEditar}
          onClose={() => setDiaEditar(null)}
          onSuccess={obtenerResumenes}
        />
      )}

      {diaEliminar && (
        <ConfirmDeleteModal
          title="Eliminar registro"
          message={`Vas a eliminar el registro del ${formatearFecha(diaEliminar.fecha)}. Esta acción no se puede deshacer.`}
          onClose={() => setDiaEliminar(null)}
          onConfirm={() => eliminarDia(diaEliminar.id)}
        />
      )}
    </DashboardLayout>
  );
}
