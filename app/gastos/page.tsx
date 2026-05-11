import DashboardLayout from "../../components/DashboardLayout";

export default function GastosPage() {
  return (
    <DashboardLayout>

      <h1 className="text-4xl font-bold mb-2">
        Gastos
      </h1>

      <p className="text-zinc-400 mb-8">
        Gestión de gastos del taller
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        Tabla de gastos próximamente...
      </div>

    </DashboardLayout>
  );
}