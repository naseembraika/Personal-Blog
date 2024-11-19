const { signup: authorSignup, login: authorLogin } = require('../controllers/author')

const renderLoginPage = (req, res, next) => res.render('auth/login', { pageTitle: 'Dashboard | Login Page', headSection: "Login" });

const renderSignupPage = (req, res, next) => res.render('auth/signup', { signupData: {}, pageTitle: 'Dashboard | Sign Up', headSection: 'Sign Up' })

const signup = authorSignup;

const login = authorLogin;

module.exports = {
    renderLoginPage,
    renderSignupPage,
    signup,
    login
}