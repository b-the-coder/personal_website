import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app'; // 引入上面定义好的根组件

// 找到 HTML 里的 <div id="root"></div>，然后把 <App /> 放进去
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
