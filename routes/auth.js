const { Router } = require('express')
const { authController } = require('../controllers')

const router = Router();

router.get('/', (req, res) => res.redirect('/auth/login'));
router.get('/login', authController.renderLoginPage)
router.get('/signup', authController.renderSignupPage)

router.post('/login', authController.login)
router.post('/signup', authController.signup)

router.use((req, res) => res.redirect('/auth/login'));

module.exports = router;