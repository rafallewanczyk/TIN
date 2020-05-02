import React from 'react';
import { Layout } from 'antd';
// @ts-ignore
import { ReactQueryDevtools } from 'react-query-devtools';
import { Link } from '@reach/router';
import style from './HelloWorld.module.css';
import logo from './mono-ooo-printeradmin.svg';
import { AppContent } from '../content/AppContent';
import { AppMenu } from './app-menu/AppMenu';

const { Content, Footer, Sider } = Layout;

export interface HelloWorldProps {}

const LOGO_SIZE = 32;

export const AppLayout: React.FC<HelloWorldProps> = () => (
  <Layout className={style.layout}>
    <Sider breakpoint="md" className={style.sider} collapsedWidth="0">
      <Link to="/">
        <div className={style.logo}>
          <img alt="logo" height={LOGO_SIZE} src={logo} width={LOGO_SIZE} />
        </div>
      </Link>
      <AppMenu />
    </Sider>
    <Layout className={style.layout}>
      <Content className={style.content}>
        <AppContent />
      </Content>
      <Footer className={style.footer}>Ant Design ©2018 Created by Ant UED</Footer>
    </Layout>
    <ReactQueryDevtools initialIsOpen={false} />
  </Layout>
);
