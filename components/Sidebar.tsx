import Link from "next/link";

export default function Sidebar() {
  return (
  <aside className="w-72 bg-zinc-950 border-r border-zinc-800 p-6">

    <h1 className="text-3xl font-bold mb-10">
      Taller Pro
    </h1>

    <nav className="space-y-4">

      <Link href="/">
        <div className="bg-blue-500/20 border border-blue-500/30 text-blue-400 p-4 rounded-2xl cursor-pointer">
          Dashboard
        </div>
      </Link>

      <Link href="/clientes">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl cursor-pointer hover:bg-zinc-800 transition">
          Clientes
        </div>
      </Link>

      <Link href="/vehiculos">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl cursor-pointer hover:bg-zinc-800 transition">
          Vehículos
        </div>
      </Link>

      <Link href="/caja">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl cursor-pointer hover:bg-zinc-800 transition">
          Caja
        </div>
      </Link>

      <Link href="/gastos">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl cursor-pointer hover:bg-zinc-800 transition">
          Gastos
        </div>
      </Link>

    </nav>

  </aside>
);
}