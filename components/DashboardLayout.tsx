import Sidebar from "./Sidebar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex">

      <Sidebar />

      <section className="flex-1 p-8">
        {children}
      </section>

    </main>
  );
}