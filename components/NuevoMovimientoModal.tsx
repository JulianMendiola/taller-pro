
"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase";

interface Props {

  onClose: () => void;

  onSuccess: () => void;

}

export default function NuevoMovimientoModal({
  onClose,
  onSuccess,
}: Props) {

  const [tipo, setTipo] =
    useState("Salida");

  const [categoria, setCategoria] =
    useState("");

  const [descripcion, setDescripcion] =
    useState("");

  const [monto, setMonto] =
    useState("");

  const [fecha, setFecha] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [loading, setLoading] =
    useState(false);

  async function crearMovimiento() {

    if (
      !categoria ||
      !descripcion ||
      !monto
    ) {
      alert("Completar todos los campos");
      return;
    }

    setLoading(true);

    const { error } = await supabase

      .from("movimientos_financieros")

      .insert([

        {
          tipo,
          categoria,
          descripcion,
          monto: Number(monto),
          fecha,
        },

      ]);

    setLoading(false);

    if (error) {

      console.error(error);

      alert("Error al guardar");

      return;
    }

    onSuccess();

    onClose();
  }

  return (

    <div
      className="
        fixed
        inset-0
        bg-black/70
        flex
        items-center
        justify-center
        z-50
        p-4
      "
    >

      <div
        className="
          w-full
          max-w-xl
          bg-zinc-950
          border border-zinc-800
          rounded-3xl
          p-6 md:p-8
        "
      >

        {/* HEADER */}
        <div className="mb-8">

          <h2
            className="
              text-2xl
              md:text-3xl
              font-bold
            "
          >
            Nuevo Movimiento
          </h2>

          <p className="text-zinc-400 mt-2">
            Registrar ingreso o gasto
          </p>

        </div>

        {/* FORM */}
        <div className="space-y-5">

          {/* TIPO */}
          <div>

            <label className="text-sm text-zinc-400">
              Tipo
            </label>

            <select
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value)
              }
              className="
                w-full
                mt-2
                bg-zinc-900
                border border-zinc-800
                rounded-2xl
                px-4 py-3
                outline-none
              "
            >

              <option value="Entrada">
                Entrada
              </option>

              <option value="Salida">
                Salida
              </option>

            </select>

          </div>

          {/* CATEGORIA */}
          <div>

            <label className="text-sm text-zinc-400">
              Categoría
            </label>

            <input
              type="text"
              placeholder="Ej: IVA"
              value={categoria}
              onChange={(e) =>
                setCategoria(e.target.value)
              }
              className="
                w-full
                mt-2
                bg-zinc-900
                border border-zinc-800
                rounded-2xl
                px-4 py-3
                outline-none
              "
            />

          </div>

          {/* DESCRIPCION */}
          <div>

            <label className="text-sm text-zinc-400">
              Descripción
            </label>

            <input
              type="text"
              placeholder="Detalle del movimiento"
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
              className="
                w-full
                mt-2
                bg-zinc-900
                border border-zinc-800
                rounded-2xl
                px-4 py-3
                outline-none
              "
            />

          </div>

          {/* MONTO */}
          <div>

            <label className="text-sm text-zinc-400">
              Monto
            </label>

            <input
              type="number"
              placeholder="100000"
              value={monto}
              onChange={(e) =>
                setMonto(e.target.value)
              }
              className="
                w-full
                mt-2
                bg-zinc-900
                border border-zinc-800
                rounded-2xl
                px-4 py-3
                outline-none
              "
            />

          </div>

          {/* FECHA */}
          <div>

            <label className="text-sm text-zinc-400">
              Fecha
            </label>

            <input
              type="date"
              value={fecha}
              onChange={(e) =>
                setFecha(e.target.value)
              }
              className="
                w-full
                mt-2
                bg-zinc-900
                border border-zinc-800
                rounded-2xl
                px-4 py-3
                outline-none
              "
            />

          </div>

        </div>

        {/* BOTONES */}
        <div
          className="
            flex
            flex-col
            md:flex-row
            gap-4
            mt-8
          "
        >

          <button
            onClick={onClose}
            className="
              flex-1
              bg-zinc-800
              hover:bg-zinc-700
              transition
              py-3
              rounded-2xl
            "
          >
            Cancelar
          </button>

          <button
            onClick={crearMovimiento}
            disabled={loading}
            className="
              flex-1
              bg-blue-500
              hover:bg-blue-600
              transition
              py-3
              rounded-2xl
              font-semibold
            "
          >

            {
              loading
                ? "Guardando..."
                : "Guardar"
            }

          </button>

        </div>

      </div>

    </div>

  );
}

