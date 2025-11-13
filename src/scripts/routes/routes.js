import HomePage from '../pages/home/home-page';
import AddPage from '../pages/add/add-pages';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import SavedPage from '../pages/saved/saved-page';  // Import halaman SavedPage

const routes = {
  '/': new HomePage(),
  '/add': new AddPage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/saved': new SavedPage(),  // Rute baru untuk halaman Cerita Tersimpan
};

window.addEventListener('hashchange', () => {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      app.renderPage();
    });
  } else {
    app.renderPage();
  }
});

export default routes;
