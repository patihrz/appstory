// src/scripts/routes/routes.js

import LoginPage from '../pages/login/login-page.js';
import RegisterPage from '../pages/register/register-page.js';
import HomePage from '../pages/home/home-page.js';
import AddStoryPage from '../pages/add-story/add-story-page.js';
import DetailStoryPage from '../pages/detail-story/detail-story-page.js'; // Impor baru
import AboutPage from '../pages/about/about-page.js';


const routes = {
  '#login': LoginPage,
  '#register': RegisterPage,
  '#home': HomePage,
  '#add-story': AddStoryPage,
  '#story/:id': DetailStoryPage, // Rute baru untuk detail cerita dengan parameter ID
  '#about': AboutPage,
  // '/': HomePage, // Rute default
};

export default routes;
