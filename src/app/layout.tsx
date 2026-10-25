import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import Encabezado from "@/components/Encabezado";
import NavInferior from "@/components/NavInferior";
import PiePagina from "@/components/PiePagina";
import PuertaBienvenida from "@/components/PuertaBienvenida";
import { DatosProvider } from "@/context/DatosContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Cuentas Claras", template: "%s · Cuentas Claras" },
  description: "Lleva tus ingresos, gastos, deudas y ahorros de forma sencilla, desde tu celular.",
  applicationName: "Cuentas Claras",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "Cuentas Claras", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#15803d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={nunito.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <ToastProvider>
          <DatosProvider>
            <PuertaBienvenida>
              <Encabezado />
              <main className="mx-auto max-w-3xl px-4 pt-5">{children}</main>
              <PiePagina />
              {/* Espacio para que la barra inferior no tape el contenido */}
              <div className="h-24" aria-hidden />
              <NavInferior />
            </PuertaBienvenida>
          </DatosProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
