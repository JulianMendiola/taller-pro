"use client";

interface Props {
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  onClose,
  onConfirm,
}: Props) {

  return (

    <div
      className="
        fixed inset-0
        bg-black/70
        flex items-center justify-center
        z-50
      "
    >

      <div
        className="
          bg-zinc-900
          border border-zinc-800
          rounded-3xl
          p-8
          w-full
          max-w-md
        "
      >

        <h2 className="text-3xl font-bold mb-4 text-red-400">
          Eliminar cliente
        </h2>

        <p className="text-zinc-400 mb-8">
          Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-4">

          <button
            onClick={onClose}
            className="
              px-5 py-3
              rounded-2xl
              bg-zinc-800
              hover:bg-zinc-700
              transition
            "
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="
              px-5 py-3
              rounded-2xl
              bg-red-500
              hover:bg-red-600
              transition
              font-semibold
            "
          >
            Eliminar
          </button>

        </div>

      </div>

    </div>

  );
}