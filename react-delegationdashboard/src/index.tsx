import React from 'react';
import ReactDOM from 'react-dom';
import { StateInspector } from 'reinspect';
import App from './App';
import './assets/styles/theme.scss';

let MountedApp = <App />;

(() => {
  const g = window.document.createElement('script');
  g.id = 'erdboxScript';
  g.type = 'text/javascript';
  g.async = true;
  g.defer = true;
  g.src = 'https://cdn.jsdelivr.net/npm/erdbox@1.12.1/dist/erdbox.js';
  window.document.body.appendChild(g);
})();

if (process.env.NODE_ENV === 'development') {
  MountedApp = (
    <StateInspector name="App">
      <App />
    </StateInspector>
  );
}

ReactDOM.render(MountedApp, document.getElementById('root'));
