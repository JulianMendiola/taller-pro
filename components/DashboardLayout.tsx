"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  Car,
  Landmark,
  Menu,
  X,
} from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: Props) {

  const pathname = usePathname();

  const [menuAbierto, setMenuAbierto] =
    useState(false);

    async function cerrarSesion() {

  await supabase.auth.signOut();

  window.location.href = "/login";

}

  const links = [

    {
      nombre: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },

    {
      nombre: "Clientes",
      href: "/clientes",
      icon: Users,
    },

    {
      nombre: "Vehículos y Trabajos",
      href: "/vehiculos",
      icon: Car,
    },

    {
      nombre: "Caja",
      href: "/caja",
      icon: Landmark,
    },

  ];

  return (

    <div
      className="
        min-h-screen
        bg-black
        text-white
      "
    >

      {/* MOBILE TOPBAR */}
      <div
        className="
          lg:hidden
          flex
          items-center
          justify-between
          p-5
          border-b
          border-zinc-800
          sticky
          top-0
          z-50
          bg-black/90
          backdrop-blur-xl
        "
      >

        <h1 className="text-2xl font-bold">
          TallerPro
        </h1>

        <button
          onClick={() =>
            setMenuAbierto(!menuAbierto)
          }
          className="
            bg-zinc-900
            border border-zinc-800
            p-3
            rounded-2xl
          "
        >

          {
            menuAbierto
              ? <X size={24} />
              : <Menu size={24} />
          }

        </button>

      </div>

      <div className="flex">

        {/* OVERLAY MOBILE */}
        {
          menuAbierto && (

            <div
              onClick={() =>
                setMenuAbierto(false)
              }
              className="
                fixed
                inset-0
                bg-black/70
                z-40
                lg:hidden
              "
            />

          )
        }

        {/* SIDEBAR */}
        <aside
          className={`
            fixed
            top-0
            left-0
            h-screen
            w-[250px] sm:w-[280px]
            bg-zinc-950
            border-r
            border-zinc-800
            z-50
            transition-all
            duration-300

            lg:translate-x-0

            ${
              menuAbierto
                ? "translate-x-0"

                : "-translate-x-full"
            }
          `}
        >

          {/* LOGO */}
          <div
            className="
              p-8
              border-b
              border-zinc-800
            "
          >

            <h1 className="text-3xl font-bold">
              TallerPro
            </h1>

            <p className="text-zinc-500 mt-2">
              Gestión automotor
            </p>

          </div>

          {/* LINKS */}
          <nav className="p-5 space-y-2">

            {
              links.map((link) => {

                const Icon = link.icon;

                const activo =
                  pathname === link.href;

                return (

                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() =>
                      setMenuAbierto(false)
                    }
                    className={`
                      flex
                      items-center
                      gap-4
                     px-4
py-3
md:px-5
md:py-4
                      rounded-2xl
                      transition-all

                      ${
                        activo

                          ? `
                            bg-blue-500/20
                            text-blue-400
                            border border-blue-500/20
                          `

                          : `
                            hover:bg-zinc-900
                            text-zinc-300
                          `
                      }
                    `}
                  >

                    <Icon size={22} />

                    <span className="font-medium">
                      {link.nombre}
                    </span>

                  </Link>

                );

              })
            }

<button

  onClick={cerrarSesion}

  className="
    mt-6
    w-full
    flex
    items-center
    gap-4
    px-4
    py-3
    rounded-2xl
    transition-all
    text-red-400
    hover:bg-red-500/10
  "
>

  <LogOut size={22} />

  <span className="font-medium">
    Cerrar sesión
  </span>

</button>
          </nav>

        </aside>

        {/* CONTENT */}
        <main
          className="
            flex-1
            lg:ml-[280px]
            p-3 sm:p-5 md:p-8
          "
        >

          {children}

        </main>

      </div>

    </div>

  );
}