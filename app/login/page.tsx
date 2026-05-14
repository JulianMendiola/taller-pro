"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function iniciarSesion() {

    setLoading(true);

    setError("");

    const { error } =

      await supabase.auth.signInWithPassword({

        email,
        password,

      });

    if (error) {

      setError(error.message);

      setLoading(false);

      return;
    }

    router.push("/");
  }

  return (

    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-black
        px-6
      "
    >

      <div
        className="
          w-full
          max-w-md
          bg-zinc-900
          border border-zinc-800
          rounded-3xl
          p-8
        "
      >

        <h1
          className="
            text-4xl
            font-bold
            mb-2
          "
        >
          JuliGPT
        </h1>

        <p
          className="
            text-zinc-400
            mb-8
          "
        >
          Iniciar sesión
        </p>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="
              w-full
              bg-black
              border border-zinc-800
              rounded-2xl
              px-4 py-4
              outline-none
            "
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="
              w-full
              bg-black
              border border-zinc-800
              rounded-2xl
              px-4 py-4
              outline-none
            "
          />

        </div>

        {error && (

          <div
            className="
              mt-4
              text-red-400
              text-sm
            "
          >
            {error}
          </div>

        )}

        <button

          onClick={iniciarSesion}

          disabled={loading}

          className="
            w-full
            mt-6
            bg-blue-500
            hover:bg-blue-600
            transition
            py-4
            rounded-2xl
            font-semibold
          "
        >

          {

            loading

              ? "Ingresando..."

              : "Ingresar"

          }

        </button>

      </div>

    </div>

  );
}