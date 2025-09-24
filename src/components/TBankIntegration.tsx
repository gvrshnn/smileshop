// ./src/components/TBankIntegration.tsx
"use client"; // <-- Важно!
import { useEffect } from 'react';

// Определение типов на основе инструкции Т-Банк
interface PaymentIntegrationHelpers {
  request(url: string, method: string, params: any): Promise<any>; // Можно уточнить типы params и возвращаемого значения
}

interface PaymentIntegrationInstance {
  init(config: IntegrationInitConfig): Promise<void>;
  helpers: PaymentIntegrationHelpers;
  // Другие методы, если нужны
}

interface IntegrationInitConfig {
  terminalKey: string | undefined;
  product: 'eacq';
  features: {
    payment?: {
      // container?: HTMLElement | null; // Убран, так как не используется
      paymentStartCallback?: (paymentType: string, orderId: string) => Promise<string>;
      // Другие настройки payment, если нужны
    };
    // Другие features, если нужны
  };
}

declare global {
  interface Window {
    PaymentIntegration: PaymentIntegrationInstance | undefined;
    onPaymentIntegrationLoad?: () => void;
  }
}

export default function TBankIntegration() {
  useEffect(() => {
    // Функция, которая будет вызвана, когда скрипт загрузится
    window.onPaymentIntegrationLoad = () => {
      console.log("T-Bank PaymentIntegration script loaded");
      try {
        if (!window.PaymentIntegration) {
          console.error("PaymentIntegration is not available on window object.");
          return;
        }

        const initConfig: IntegrationInitConfig = {
          terminalKey: process.env.NEXT_PUBLIC_TINKOFF_TERMINAL_KEY,
          product: 'eacq',
          features: {
            payment: {
              // container: null, // Будет установлен позже или через callback
              paymentStartCallback: async (paymentType: string, orderId: string) => {
                console.log("Payment start requested for orderId:", orderId, "Type:", paymentType);
                // ВАЖНО: Убедитесь, что этот API роут существует и корректно работает
                const res = await fetch('/api/orders', { // Используем ваш роут
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ paymentType, orderId }), // Передаем orderId
                });
                if (!res.ok) {
                   const errorData = await res.json();
                   console.error("API Error:", errorData);
                   throw new Error(errorData.error || `Failed to init payment: ${res.status}`);
                }
                const data = await res.json();
                console.log("Payment initialized, URL:", data.paymentURL);
                return data.paymentURL; // Возвращаем PaymentURL
              },
            },
          },
        };
        // Инициализируем PaymentIntegration
        window.PaymentIntegration.init(initConfig).catch((err: unknown) => { // Исправлен тип any на unknown
          console.error("Error initializing PaymentIntegration:", err);
          // Можно добавить более конкретную обработку ошибок, если типизировать err
        });
      } catch (err) {
        console.error("Error in onPaymentIntegrationLoad:", err);
        // Можно добавить более конкретную обработку ошибок, если типизировать err
      }
    };

    // Проверим, загрузился ли скрипт до монтирования компонента (например, из кэша)
    if (typeof window !== 'undefined' && window.PaymentIntegration) {
         window.onPaymentIntegrationLoad?.();
    }

    // Очистка при размонтировании (опционально, если нужно удалить глобальную функцию)
    return () => {
      // window.onPaymentIntegrationLoad = undefined; // Осторожно с этим, могут быть побочные эффекты
    };
  }, []); // Пустой массив зависимостей - запускается один раз после монтирования

  // Этот компонент не рендерит ничего видимого, только выполняет логику
  return null;
}