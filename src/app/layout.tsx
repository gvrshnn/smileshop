import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import Provider from "@/components/SessionProvider";
import { FilterProvider } from "@/context/FilterContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SMILESHOP",
  description: "Магазин ключей для игр",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Provider>
          <FilterProvider>{children}</FilterProvider>
        </Provider>
      </body>
    </html>
  );
}
