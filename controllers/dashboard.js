const { JSDOM } = require('jsdom');
const { marked } = require('marked')
const { ObjectId } = require('mongodb');
const { getAuthorData, updateAuthorData, logout } = require('./author');
const createDOMPurify = require('dompurify');
const articleController = require('./article');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const renderIndexPage = async (req, res, next) => {
    try {
        const response = { authorName: req.authorData.name, pageTitle: 'Dashboard Articles' };
        const articlesResult = await articleController.getArticles({ _author_id: req.authorData._id }, { sort: { created_at: -1 }, limit: 3 });
        if (!articlesResult.status) return res.status(200).render('dashboard/articles/index', { ...response });
        const articles = articlesResult.data;
        const counts = await articleController.countArticles({ _author_id: req.authorData._id });
        res.status(200).render('dashboard/articles/index', { articles, counts, ...response });
    } catch (error) {
        next(createError(500, error.message));
    }
};

const renderNewArticlePage = (req, res, next) => res.render('dashboard/articles/new', { articleData: {}, pageTitle: 'Dashboard | Create New Article' });

const renderArticleBySlug = async (req, res, next) => {
    try {
        const result = await articleController.getArticle({ slug: req.params.slug }, { projection: { cover_path: 0, _author_id: 0 } });
        if (!result.status) return res.status(404).json({ status: false, message: "Article not found" });
        result.data.markdown = DOMPurify.sanitize(marked(result.data.markdown));
        res.status(200).render('dashboard/articles/show', { articleData: result.data, pageTitle: `Dashboard | ${result.data.title}` })
    } catch (error) {
        next(createError(500, error.message))
    }
}

const renderArticleById = async (req, res, next) => {
    try {
        const result = await articleController.getArticle({ _id: new ObjectId(req.params.id) }, { projection: { _author_id: 0 } });
        if (!result.status) return res.status(404).json({ status: false, message: "Article not found" });
        res.render('dashboard/articles/edit', { articleData: result.data, pageTitle: `Dashboard Edit Article | ${result.data.title}` });
    } catch (error) {
        next(createError(500, error.message))
    }
}

const renderUpdateAuthorPage = async (req, res, next) => {
    try {
        const result = await getAuthorData({ _id: req.authorData._id }, { projection: { name: 1, username: 1, bio: 1, description: 1 } });
        res.render('dashboard/authors/edit_profile', { author: result.data, pageTitle: 'Dashboard | Edit Author Profile' })
    } catch (error) {
        next(createError(500, error.message))
    }
}

const createArticle = articleController.createArticle;

const updateAuthor = updateAuthorData;
const updateArticle = articleController.updateArticle;

const deleteArticle = articleController.deleteArticle;

module.exports = {
    renderIndexPage,
    renderNewArticlePage,
    renderUpdateAuthorPage,
    renderArticleBySlug,
    renderArticleById,
    createArticle,
    updateArticle,
    updateAuthor,
    deleteArticle,
    logout
}