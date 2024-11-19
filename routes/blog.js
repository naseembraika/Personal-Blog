const { Router } = require('express')
const { blogController } = require('../controllers')
const router = Router();

router.get('/', blogController.renderHomePage)

router.get('/author/:username', blogController.renderAuthorPage)
router.get('/article/:slug', blogController.renderArticlePage);

module.exports = router;