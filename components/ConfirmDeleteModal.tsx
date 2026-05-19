"use client";

interface Props {
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
}

export default function ConfirmDeleteModal({
  onClose,
  onConfirm,
  title = "Eliminar registro",
  message = "Esta accion no se puede deshacer.",
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 md:p-8">
        <h2 className="mb-4 text-2xl font-bold text-red-400 md:text-3xl">
          {title}
        </h2>

        <p className="mb-8 text-zinc-400">{message}</p>

        <div className="flex flex-col justify-end gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="rounded-2xl bg-zinc-800 px-5 py-3 transition hover:bg-zinc-700"
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="rounded-2xl bg-red-500 px-5 py-3 font-semibold transition hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
