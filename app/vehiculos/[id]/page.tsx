"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Car, Phone, User } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface Vehiculo {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  anio?: string | null;
  clientes?: {
    nombre: string;
    telefono: string;
    email?: string;
  } | null;
}

interface Orden {
  id: number;
  descripcion: string;
  estado: string;
  fecha: string;
}

const estadoStyles: Record<string, string> = {
  Finalizado: "bg-green-500/20 text-green-400",
  "En proceso": "bg-yellow-500/20 text-yellow-400",
  Pendiente: "bg-red-500/20 text-red-400",
};

function formatearFecha(valor?: string) {
  if (!valor) return "-";
  const [anio, mes, dia] = valor.slice(0, 10).split("-");
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : valor;
}

export default function VehiculoDetallePage() {
  const params = useParams();
  const router = useRouter();

  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (params.id) {
      cargarDatos();
    }
  }, [params.id]);

  async function cargarDatos() {
    setCargando(true);

    const [{ data: veh }, { data: ords }] = await Promise.all([
      supabase
        .from("vehiculos")
        .select(`*, clientes(nombre, telefono, email)`)
        .eq("id", params.id)
        .single(),
      supabase
        .from("ordenes_trabajo")
        .select("*")
        .eq("vehiculo_id", params.id)
        .order("fecha", { ascending: false })
        .order("id", { ascending: false }),
    ]);

    setVehiculo(veh);
    setOrdenes(ords || []);
    setCargando(false);
  }

  if (cargando) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center text-zinc-500">
          Cargando...
        </div>
      </DashboardLayout>
    );
  }

  if (!vehiculo) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-zinc-500">
          <p>Vehículo no encontrado.</p>
          <button
            onClick={() => router.push("/vehiculos")}
            className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm transition hover:bg-zinc-800"
          >
            Volver a vehículos
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const finalizadas = ordenes.filter((o) => o.estado === "Finalizado").length;
  const enProceso = ordenes.filter((o) => o.estado === "En proceso").length;

  return (
    <DashboardLayout>
      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">Volver</span>
      </button>

      {/* HEADER */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20">
          <Car size={32} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl md:text-5xl font-bold">{vehiculo.patente}</h1>
          <p className="text-zinc-400 mt-1 text-lg">
            {vehiculo.marca} {vehiculo.modelo}
            {vehiculo.anio ? ` · ${vehiculo.anio}` : ""}
          </p>
        </div>
      </div>

      {/* INFO CLIENTE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
            <User size={20} className="text-zinc-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs mb-1">Cliente</p>
            <p className="font-semibold">{vehiculo.clientes?.nombre || "-"}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
            <Phone size={20} className="text-zinc-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-xs mb-1">Teléfono</p>
            <p className="font-semibold">{vehiculo.clientes?.telefono || "-"}</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <p className="text-zinc-400 text-xs mb-2">Órdenes totales</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold">{ordenes.length}</span>
            <div className="text-sm text-zinc-400 pb-1">
              <span className="text-green-400">{finalizadas} finalizadas</span>
              {enProceso > 0 && (
                <span className="text-yellow-400 ml-2">· {enProceso} en proceso</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* HISTORIAL — MOBILE */}
      <div className="md:hidden">
        <h2 className="text-xl font-bold mb-4">Historial de trabajos</h2>

        {ordenes.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-500">
            Este vehículo no tiene órdenes registradas.
          </div>
        ) : (
          <div className="space-y-3">
            {ordenes.map((orden) => (
              <article
                key={orden.id}
                className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-semibold">{orden.descripcion}</p>
                  <span
                    className={`rounded-xl px-3 py-1 text-xs font-semibold shrink-0 ${
                      estadoStyles[orden.estado] || estadoStyles.Pendiente
                    }`}
                  >
                    {orden.estado}
                  </span>
                </div>
                <p className="text-sm text-zinc-500">{formatearFecha(orden.fecha)}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* HISTORIAL — DESKTOP */}
      <div className="hidden md:block bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-2xl font-bold">Historial de trabajos</h2>
        </div>

        {ordenes.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            Este vehículo no tiene órdenes registradas.
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-zinc-800 text-zinc-400">
              <tr>
                <th className="p-6 text-left">Trabajo</th>
                <th className="p-6 text-left">Estado</th>
                <th className="p-6 text-left">Fecha</th>
              </tr>
            </thead>

            <tbody>
              {ordenes.map((orden) => (
                <tr
                  key={orden.id}
                  className="border-b border-zinc-800 transition hover:bg-zinc-800/40"
                >
                  <td className="p-6 font-semibold">{orden.descripcion}</td>
                  <td className="p-6">
                    <span
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        estadoStyles[orden.estado] || estadoStyles.Pendiente
                      }`}
                    >
                      {orden.estado}
                    </span>
                  </td>
                  <td className="p-6 text-zinc-400">{formatearFecha(orden.fecha)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
