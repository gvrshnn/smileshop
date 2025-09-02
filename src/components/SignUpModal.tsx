// src/components/SignUpModal.tsx
"use client";

import { useState } from "react";
import { Modal, Form, Input, Button, message, Result } from "antd";
import { MailOutlined, CheckCircleOutlined } from "@ant-design/icons";

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SignUpModal({ open, onClose }: SignUpModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form'); // Состояние для отображения формы или сообщения об успехе
  const [userEmail, setUserEmail] = useState<string>(''); // Для отображения в сообщении
  const [form] = Form.useForm();

  const onFinish = async (values: { email: string; password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error("Пароли не совпадают");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Сохраняем email для отображения в сообщении
        setUserEmail(values.email);
        // Переключаемся на экран успеха
        setStep('success');
        // НЕ закрываем модалку
        message.success("Письмо с подтверждением отправлено!");
      } else {
        message.error(data.error || "Ошибка при регистрации");
      }
    } catch (error) {
      message.error("Ошибка сети");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Сбрасываем состояние при закрытии
    form.resetFields();
    setStep('form');
    setUserEmail('');
    onClose();
  };

  const handleBackToForm = () => {
    setStep('form');
    setUserEmail('');
    form.resetFields();
  };

  return (
    <Modal
      title={step === 'form' ? "Регистрация" : "Подтверждение регистрации"}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={450}
      closeIcon={step === 'success'} // Показываем крестик только на экране успеха
    >
      {step === 'form' ? (
        // Форма регистрации
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Введите email" },
              { type: "email", message: "Введите корректный email" }
            ]}
          >
            <Input placeholder="example@email.com" style={{ fontSize: '16px' }} />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: "Введите пароль" },
              { min: 6, message: "Пароль должен содержать минимум 6 символов" }
            ]}
          >
            <Input.Password placeholder="Минимум 6 символов" style={{ fontSize: '16px' }} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Подтвердите пароль"
            rules={[
              { required: true, message: "Подтвердите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Повторите пароль" style={{ fontSize: '16px' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Зарегистрироваться
          </Button>
        </Form>
      ) : (
        // Экран успеха с сообщением о проверке почты
        <Result
          icon={<MailOutlined style={{ color: '#01f501', fontSize: '48px' }} />}
          title="Проверьте вашу почту"
          subTitle={
            <div style={{ textAlign: 'left', marginTop: 16 }}>
              <p>Мы отправили письмо с подтверждением на адрес:</p>
              <div style={{ 
                background: '#f5f5f5', 
                padding: '8px 12px', 
                borderRadius: '4px', 
                fontFamily: 'monospace',
                fontSize: '14px',
                margin: '8px 0',
                textAlign: 'center'
              }}>
                {userEmail}
              </div>
              <p style={{ marginTop: 12 }}>
                <CheckCircleOutlined style={{ color: '#01f501', marginRight: 8 }} />
                Перейдите по ссылке в письме, чтобы завершить регистрацию.
              </p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: 16 }}>
                Не получили письмо? Проверьте папку "Спам" или попробуйте зарегистрироваться снова.
              </p>
            </div>
          }
          extra={[
            <Button key="back" onClick={handleBackToForm}>
              Попробовать снова
            </Button>,
            <Button key="close" type="primary" onClick={handleClose}>
              Понятно
            </Button>,
          ]}
        />
      )}
    </Modal>
  );
}