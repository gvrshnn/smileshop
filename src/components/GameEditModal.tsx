"use client";

import { Modal, Form, Input, InputNumber, Button, Space, message, Popconfirm } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { Game } from "@prisma/client";

interface Props {
  game: Game | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedGame: Partial<Game>) => Promise<void>;
  isCreating?: boolean;
}

export default function GameEditModal({ game, open, onClose, onSave, isCreating = false }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState<string[]>([]);

  // Инициализируем форму при открытии
  useEffect(() => {
    if (open) {
      if (game && !isCreating) {
        // Режим редактирования - заполняем форму данными игры
        form.setFieldsValue({
          title: game.title,
          description: game.description,
          price: game.price,
          platform: game.platform,
          imageUrl: game.imageUrl,
        });
        setKeys(game.keys as string[] || []);
      } else {
        // Режим создания - очищаем форму
        form.resetFields();
        setKeys([]);
      }
    }
  }, [game, open, form, isCreating]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const gameData = {
        ...values,
        keys: keys,
      };

      await onSave(gameData);
      message.success(isCreating ? "Игра успешно создана" : "Игра успешно обновлена");
      onClose();
    } catch (error) {
      message.error(isCreating ? "Ошибка при создании игры" : "Ошибка при сохранении игры");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const addKey = () => {
    setKeys([...keys, ""]);
  };

  const removeKey = (index: number) => {
    const newKeys = keys.filter((_, i) => i !== index);
    setKeys(newKeys);
  };

  const updateKey = (index: number, value: string) => {
    const newKeys = [...keys];
    newKeys[index] = value;
    setKeys(newKeys);
  };

  const handleClose = () => {
    form.resetFields();
    setKeys([]);
    onClose();
  };

  const modalTitle = isCreating ? "Добавить новую игру" : "Редактировать игру";
  const saveButtonText = isCreating ? "Создать" : "Сохранить";

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={modalTitle}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Отмена
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSave}>
          {saveButtonText}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: "Введите название игры" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: "Введите описание игры" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name="price"
          label="Цена (₽)"
          rules={[{ required: true, message: "Введите цену игры" }]}
        >
          <InputNumber min={0} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="platform"
          label="Платформа"
          rules={[{ required: true, message: "Введите платформу" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="URL изображения"
          rules={[{ required: true, message: "Введите URL изображения" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Ключи к игре">
          <div style={{ marginBottom: 8 }}>
            <Button type="dashed" onClick={addKey} icon={<PlusOutlined />}>
              Добавить ключ
            </Button>
          </div>
          
          {keys.map((key, index) => (
            <Space key={index} style={{ display: "flex", marginBottom: 8 }}>
              <Input
                value={key}
                onChange={(e) => updateKey(index, e.target.value)}
                placeholder="Введите ключ к игре"
                style={{ flex: 1 }}
              />
              <Popconfirm
                title="Удалить ключ?"
                onConfirm={() => removeKey(index)}
                okText="Да"
                cancelText="Нет"
              >
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Space>
          ))}
          
          {keys.length === 0 && (
            <div style={{ color: "#999", fontStyle: "italic" }}>
              Ключи не добавлены
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
}
