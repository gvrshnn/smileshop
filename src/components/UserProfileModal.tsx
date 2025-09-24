// ./src/components/UserProfileModal.tsx
"use client";
import { useState, useEffect, useCallback } from "react"; // Добавлен useCallback
import { Modal, Button, Form, Input, List, Typography, message, Popconfirm, Space, Alert } from "antd";
import { UserOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons"; // Убран KeyOutlined
import { signOut, useSession } from "next-auth/react";

const { Title, Text } = Typography;

interface UserProfileModalProps {
    open: boolean;
    onClose: () => void;
}

interface PurchasedGameKey {
    id: string;
    game: {
        id: number;
        title: string;
    };
    key: string;
    purchaseDate: string;
    price: number;
}

interface CustomMessage {
    type: 'success' | 'error';
    text: string;
}

export default function UserProfileModal({ open, onClose }: UserProfileModalProps) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [changePasswordForm] = Form.useForm();
    const [purchasedKeys, setPurchasedKeys] = useState<PurchasedGameKey[]>([]);
    const [keysLoading, setKeysLoading] = useState(false);
    const [customMessage, setCustomMessage] = useState<CustomMessage | null>(null);

    // Обернут в useCallback
    const fetchPurchasedKeys = useCallback(async () => {
        if (!session?.user?.id) return;
        setKeysLoading(true);
        try {
            const res = await fetch(`/api/user/keys?userId=${encodeURIComponent(session.user.id)}`);
            const data = await res.json();
            if (res.ok) {
                setPurchasedKeys(data.keys || []);
            } else {
                setCustomMessage({ type: 'error', text: data.error || "Ошибка загрузки ключей" });
            }
        } catch (error) { // Убрана переменная error из списка, так как она не используется
            setCustomMessage({ type: 'error', text: "Ошибка сети при загрузке ключей" });
        } finally {
            setKeysLoading(false);
        }
    }, [session?.user?.id]); // Добавлена зависимость

    useEffect(() => {
        if (open) {
            fetchPurchasedKeys();
            setCustomMessage(null);
        }
    }, [open, fetchPurchasedKeys]); // Добавлена fetchPurchasedKeys в зависимости

    const handlePasswordChange = async (values: { oldPassword: string; newPassword: string }) => {
        setCustomMessage(null);
        if (!session?.user?.email) {
            setCustomMessage({ type: 'error', text: "Пользователь не авторизован" });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: session.user.email,
                    oldPassword: values.oldPassword,
                    newPassword: values.newPassword,
                }),
            });
            const textResponse = await res.text();
            let data = null;
            if (textResponse) {
                try {
                    data = JSON.parse(textResponse);
                } catch (parseError) { // Убрана переменная parseError из списка, так как она не используется
                    setCustomMessage({ type: 'error', text: "Некорректный ответ от сервера" });
                    return;
                }
            } else {
                data = {};
            }
            if (res.ok) {
                setCustomMessage({ type: 'success', text: "Пароль успешно изменен" });
                changePasswordForm.resetFields();
                setTimeout(() => {
                    if (open) {
                        setCustomMessage(null);
                    }
                }, 3000);
            } else {
                const errorMessage = data?.error || `Ошибка ${res.status}: ${res.statusText}`;
                setCustomMessage({ type: 'error', text: errorMessage });
            }
        } catch (error) { // Убрана переменная error из списка, так как она не используется
            setCustomMessage({ type: 'error', text: "Ошибка сети при изменении пароля" });
        } finally {
            setLoading(false);
        }
    };

    const handleAccountDeletion = async () => {
        if (!session?.user?.id) {
            message.error("Пользователь не авторизован");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/user/delete-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: session.user.id,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                await signOut({ redirect: false });
                onClose();
            } else {
                message.error(data.error || "Ошибка при удалении аккаунта");
            }
        } catch (error) { // Убрана переменная error из списка, так как она не используется
            message.error("Ошибка сети при удалении аккаунта");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <UserOutlined />
                    <span>Личный кабинет</span>
                </Space>
            }
            open={open}
            onCancel={() => {
                setCustomMessage(null);
                onClose();
            }}
            footer={[
                <Button key="close" onClick={() => {
                    setCustomMessage(null);
                    onClose();
                }}>
                    Закрыть
                </Button>,
            ]}
            width={600}
        >
            {session?.user?.email && (
                <div style={{ marginBottom: 24 }}>
                    <Title level={5}>Ваш email (логин):</Title>
                    <Text code>{session.user.email}</Text>
                </div>
            )}
            <div style={{ marginBottom: 24 }}>
                <Title level={5}>Изменить пароль</Title>
                {customMessage && (
                    <div style={{ marginBottom: 16 }}>
                        <Alert
                            message={customMessage.text}
                            type={customMessage.type}
                            showIcon
                            closable
                            onClose={() => setCustomMessage(null)}
                        />
                    </div>
                )}
                <Form
                    form={changePasswordForm}
                    onFinish={handlePasswordChange}
                    layout="vertical"
                >
                    <Form.Item
                        name="oldPassword"
                        label="Старый пароль"
                        rules={[{ required: true, message: 'Пожалуйста, введите старый пароль!' }]}
                        hasFeedback
                        validateTrigger="onBlur"
                    >
                        <Input.Password
                            placeholder="Введите старый пароль"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            style={{ fontSize: '16px' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="Новый пароль"
                        rules={[
                            { required: true, message: 'Пожалуйста, введите новый пароль!' },
                            { min: 6, message: 'Пароль должен быть не менее 6 символов!' },
                        ]}
                        hasFeedback
                        validateTrigger="onBlur"
                    >
                        <Input.Password
                            placeholder="Введите новый пароль"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            style={{ fontSize: '16px' }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="confirmNewPassword"
                        label="Подтвердите новый пароль"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Пожалуйста, подтвердите новый пароль!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Пароли не совпадают!'));
                                },
                            }),
                        ]}
                        hasFeedback
                        validateTrigger="onBlur"
                    >
                        <Input.Password
                            placeholder="Подтвердите новый пароль"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            style={{ fontSize: '16px' }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Изменить пароль
                        </Button>
                    </Form.Item>
                </Form>
            </div>
            <div style={{ marginBottom: 24 }}>
                <Title level={5}>Купленные ключи</Title>
                <List
                    loading={keysLoading}
                    dataSource={purchasedKeys}
                    locale={{ emptyText: 'У вас пока нет купленных ключей.' }}
                    renderItem={(item) => (
                        <List.Item>
                            <List.Item.Meta
                                title={item.game.title}
                                description={
                                    <>
                                        <Text strong>Ключ: </Text>
                                        <Text code>{item.key}</Text>
                                        <br />
                                        <Text type="secondary">Дата покупки: {new Date(item.purchaseDate).toLocaleString()}</Text>
                                        <br />
                                        <Text type="secondary">Цена: {item.price} руб.</Text>
                                    </>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
            <div>
                <Title level={5} style={{ color: 'red' }}>Опасная зона</Title>
                <Popconfirm
                    title="Удалить аккаунт?"
                    description="Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо."
                    onConfirm={handleAccountDeletion}
                    okText="Да, удалить"
                    cancelText="Отмена"
                    okButtonProps={{ loading: loading }}
                >
                    <Button danger icon={<DeleteOutlined />} loading={loading}>
                        Удалить аккаунт
                    </Button>
                </Popconfirm>
            </div>
        </Modal>
    );
}