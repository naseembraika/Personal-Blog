const { Router } = require('express')
const { dashboardController } = require('../controllers')
const multer = require('multer')

const imgMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
const upload = multer({
    dest: process.env.UPLOAD_PATH,
    fileFilter: function (req, file, callback) {
        callback(null, imgMimeTypes.includes(file.mimetype));
    }
})

const router = Router();

router.get('/', dashboardController.renderIndexPage);
router.get('/article/new', dashboardController.renderNewArticlePage)
router.get('/author/edit', dashboardController.renderUpdateAuthorPage)
router.get('/article/:slug', dashboardController.renderArticleBySlug)
router.get('/article/edit/:id', dashboardController.renderArticleById)
router.get('/logout', dashboardController.logout)

router.post('/article/new', upload.single('cover'), dashboardController.createArticle);

router.put('/article/edit/:id', upload.single('cover'), dashboardController.updateArticle)
router.put('/author/update', upload.single('profile_cover'), dashboardController.updateAuthor)

router.delete('/article/:id', dashboardController.deleteArticle)

router.use((req, res) => res.redirect('/dashboard'));

module.exports = router;