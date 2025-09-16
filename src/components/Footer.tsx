// src/components/Footer.tsx
"use client";

import React from 'react';
import { Typography, Divider } from 'antd';
import { PhoneOutlined, MailOutlined } from '@ant-design/icons';
import styles from './Footer.module.css';

const { Title, Text } = Typography;

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.section}>
          <Title level={4} className={styles.sectionTitle}>Контакты</Title>
          <div className={styles.contactItem}>
            <PhoneOutlined className={styles.icon} />
            <Text style={{ color: 'inherit' }}><strong>Телефон:</strong> +7 (905) 551-05-50</Text>
          </div>
          <div className={styles.contactItem}>
            <MailOutlined className={styles.icon} />
            <Text style={{ color: 'inherit' }}><strong>Email:</strong> germanvershinin@yandex.ru</Text>
          </div>
          <div className={styles.contactItem}>
            <a 
              href="https://disk.yandex.ru/i/HIMJZEBkz_Ws1g" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: 'inherit' }}
            >
              Публичная оферта
            </a>
          </div>
        </div>

        <Divider type="vertical" className={styles.divider} />

        <div className={styles.section}>
          <Title level={4} className={styles.sectionTitle}>Реквизиты</Title>
          <div className={styles.requisitesItem}>
            <Text style={{ color: 'inherit' }}><strong>Наименование организации:</strong></Text>
          </div>
          <div className={styles.requisitesItem}>
            <Text style={{ color: 'inherit' }}>Индивидуальный предприниматель Вершинин Герман Александрович</Text>
          </div>
          <div className={styles.requisitesItem}>
            <Text style={{ color: 'inherit' }}><strong>ИНН:</strong> 5024 1363 9269</Text>
          </div>
          <div className={styles.requisitesItem}>
            <Text style={{ color: 'inherit' }}><strong>ОГРН:</strong> 32150 81000 02302</Text>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <Text type="secondary" style={{ color: 'inherit', opacity: 0.8 }}>&copy; {new Date().getFullYear()} SMILESHOP. Все права защищены.</Text>
      </div>
    </footer>
  );
};

export default Footer;