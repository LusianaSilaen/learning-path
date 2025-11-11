import HomePage from '../pages/home/home-page';
import AddPage from '../pages/add/add-pages';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';

const routes = {
  '/': new HomePage(),
  '/add': new AddPage(),
  '/about': new AboutPage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
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
