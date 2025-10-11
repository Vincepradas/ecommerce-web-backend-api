const fs = require('fs');
const router = require('express').Router();

fs.readdirSync(__dirname).forEach(file => {
  if (file === 'index.js') return; 
  const route = require(`./${file}`);
  const routeName = file.replace('.Route.js', '').toLowerCase();
  router.use(`/${routeName}`, route);
});

module.exports = router;
