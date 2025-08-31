import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "antd/dist/reset.css";
import Provider from "@/components/SessionProvider";
import { ConfigProvider } from "antd";
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
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#01f501',
              colorTextLightSolid: '#000000', // Черный текст на primary кнопках
            },
            components: {
              Button: {
                primaryColor: '#000000', // Черный текст на primary кнопках
                colorTextLightSolid: '#000000',
              }
            }
          }}
        >
          <Provider>
            <FilterProvider>{children}</FilterProvider>
          </Provider>
        </ConfigProvider>
      </body>
    </html>
  );
}
