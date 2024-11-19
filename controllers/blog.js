const { JSDOM } = require('jsdom');
const { marked } = require('marked')
const { getAggregate } = require('../controllers/article')
const { getAuthorData } = require('../controllers/author')
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const renderHomePage = async (req, res, next) => {
    try {
        const result = await getAggregate([
            {
                '$lookup': {
                    from: 'authors',
                    localField: '_author_id',
                    foreignField: '_id',
                    as: 'author'
                }
            },
            { '$unwind': '$author' },
            {
                '$project': {
                    slug: 1,
                    title: 1,
                    description: 1,
                    created_at: 1,
                    'author.name': 1,
                    'author.username': 1
                }
            },
            { '$sort': { created_at: -1 } },
            { '$limit': 3 }
        ]);
        const articles = result.data;
        res.render('blog/index', { articles, pageTitle: 'Clean Blog - Start Bootstrap Theme' });
    } catch (error) {
        next(createError(500, error.message));
    }
};

const renderContactPage = (req, res, next) => res.render('blog/contact', { pageTitle: 'Clean Blog - Contact' });

const renderArticlePage = async (req, res, next) => {
    try {
        const result = await getAggregate([
            { '$match': { slug: req.params.slug } },
            {
                '$lookup': {
                    from: 'authors',
                    localField: '_author_id',
                    foreignField: '_id',
                    as: 'author',
                }
            },
            { '$unwind': '$author' },
            { '$limit': 1 },
            {
                '$project': {
                    _id: 0,
                    _author_id: 0
                }
            }
        ]);
        if (!result.status) return res.status(404).json({ status: false, message: "Article not found" });
        let article = result.data[0];
        article.cover_path = article.cover_path.slice(7);
        article.author = {
            name: article.author.name,
            username: article.author.username
        }
        article.markdown = DOMPurify.sanitize(marked(article.markdown));
        res.render('blog/article', { article, pageTitle: `Clean Blog - ${article.slug}` });
    } catch (error) {
        next(createError(500, error.message));
    }
}

const renderAuthorPage = async (req, res, next) => {
    try {
        const result = await getAuthorData({ username: req.params.username },
            { projection: { name: 1, bio: 1, description: 1, profile_cover: 1 } }
        );
        if (!result.status) return res.status(400).json({ status: 'No author with that username' });
        let author = result.data;
        author.profile_cover = (author.profile_cover) ? author.profile_cover.slice(7) : null;
        author.description = DOMPurify.sanitize(marked(author.description));
        res.status(200).render('blog/about', { author: result.data, pageTitle: `Clean Blog - ${result.data.name}` });
    } catch (error) {
        next(createError(500, error.message));
    }
}

module.exports = {
    renderHomePage,
    renderArticlePage,
    renderContactPage,
    renderAuthorPage
}