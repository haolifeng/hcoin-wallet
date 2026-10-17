import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n/I18nProvider';
import 'antd/dist/reset.css';

// 语言环境由 I18nProvider 统一提供（含 antd 内置文案），随 LocaleStore 切换
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
