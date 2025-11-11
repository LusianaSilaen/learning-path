import App from './pages/app';
import '../styles/styles.css';

const app = new App({
  navigationDrawer: document.querySelector('#navigation-drawer'),
  drawerButton: document.querySelector('#drawer-button'),
  content: document.querySelector('#main-content'),
});

window.addEventListener('load', () => {
  console.log('✅ Window loaded');
  app.renderPage();
});

window.addEventListener('hashchange', () => {
  console.log('🔄 Hash changed');
  app.renderPage();
});
