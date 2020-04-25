import React from 'react';
import { Layout } from 'antd';
import style from './HelloWorld.module.css';
import logo from './mono-ooo-printeradmin.svg';
import { AppContent } from '../content/AppContent';
import { Link } from '@reach/router';
import { AppMenu } from './app-menu/AppMenu';

const { Content, Footer, Sider } = Layout;

export interface HelloWorldProps {}

const LOGO_SIZE = 32;

export const AppLayout: React.FC<HelloWorldProps> = ({}) => (
  <Layout>
    <Sider breakpoint="md" collapsedWidth="0">
      <Link to="/">
        <div className={style.logo}>
          <img src={logo} alt="logo" width={LOGO_SIZE} height={LOGO_SIZE} />
        </div>
      </Link>
      <AppMenu />
    </Sider>
    <Layout>
      <Content className={style.content}>
        <AppContent />
      </Content>
      <Footer className={style.footer}>Ant Design ©2018 Created by Ant UED</Footer>
    </Layout>
  </Layout>
);
