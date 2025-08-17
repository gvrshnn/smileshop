"use client";
import { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { signIn, useSession } from "next-auth/react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [form] = Form.useForm();
  const { data: session } = useSession();

  useEffect(() => {
    if (session && justLoggedIn) {
      message.success("Успешный вход в систему!");
      setTimeout(() => {
        form.resetFields();
        onClose();
        setJustLoggedIn(false);
      }, 1500);
    }
  }, [session, justLoggedIn, form, onClose]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      ...values,
    });

    if (res?.ok) {
      setJustLoggedIn(true);
    } else {
      message.error("Неверный email или пароль");
    }
    setLoading(false);
  };

  return (
    <Modal
      title="Вход в систему"
      open={open}
      onCancel={() => { 
        form.resetFields(); 
        setJustLoggedIn(false);
        onClose(); 
      }}
      footer={null}
      width={400}
    >
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={{ email: "admin@smileshop.local", password: "123456" }}
      >
        <Form.Item name="email" rules={[{ required: true, type: "email" }]}>
          <Input placeholder="Email" />
        </Form.Item>
        
        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password placeholder="Пароль" />
        </Form.Item>

        <Button type="primary" htmlType="submit" block loading={loading}>
          Войти
        </Button>
      </Form>
    </Modal>
  );
}
