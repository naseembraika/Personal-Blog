const { Article } = require('../models')
const { mkdirSync, copyFileSync, existsSync, rmSync, renameSync } = require('fs');
const { ObjectId } = require('mongodb')
const { join } = require('path')
const createSlug = require('slug')


const createAuthorUploadsFolder = (authorId, currentFilePath, filename) => {
    try {
        const newFilePath = join(process.env.UPLOAD_PATH, authorId);
        (!existsSync(newFilePath)) ? mkdirSync(newFilePath) : null;
        copyFileSync(currentFilePath, join(newFilePath, `${filename}`));
        rmSync(currentFilePath);
    } catch (error) {
        throw new Error(error.message);
    }
}

const deleteUploadedFile = (path) => rmSync(path);

const createArticle = async (req, res, next) => {
    try {
        const file = req.file;
        const articleData = req.body;
        const currentPagePath = 'dashboard/articles/new'
        const renderData = { articleData, pageTitle: "Dashboard | Create New Article" };

        if (!file) {
            return res.status(400).render(currentPagePath, { ...renderData, message: "You Must Upload Background Image" });
        }
        const uploadedFilePath = join(process.env.UPLOAD_PATH, file.filename);

        const validation = Article.validate(articleData);
        if (validation.error) {
            deleteUploadedFile(uploadedFilePath);
            return res.status(400).render(currentPagePath, { ...renderData, message: validation.error.message })
        }

        const slug = createSlug(articleData.title);
        const existsResult = await Article.findOne({ slug }, { projection: { slug: 1 } });
        if (existsResult.status) {
            deleteUploadedFile(uploadedFilePath);
            return res.status(400).render(currentPagePath, { ...renderData, message: "Change Title, it's already used" })
        }

        createAuthorUploadsFolder(req.authorData._id.toString(), uploadedFilePath, file.filename);
        const upperCaseLetter = (text) => text[0].toUpperCase() + text.slice(1);
        const article = new Article({
            _author_id: req.authorData._id,
            slug,
            title: upperCaseLetter(articleData.title),
            description: upperCaseLetter(articleData.description),
            markdown: articleData.markdown,
            created_at: new Date(),
            cover_path: `/${process.env.UPLOAD_PATH}/${req.authorData._id.toString()}/${file.filename}`
        });
        article.createArticle((error) => {
            if (error) return next(createError(500, error.message));
            res.status(201).redirect(`/dashboard/article/${slug}`)
        })
    } catch (error) {
        if (req.file) deleteUploadedFile(join(process.env.UPLOAD_PATH, req.file.filename));
        next(createError(500, error.message));
    }
}

const getArticle = (filter, options) => Article.findOne(filter, options);

const getArticles = (filter, options) => Article.find(filter, options);

const countArticles = (filter) => Article.countDocuments(filter);

const getAggregate = (query) => Article.aggregate(query);

const updateArticle = async (req, res, next) => {
    try {
        const file = req.file;
        let updates = {
            slug: createSlug(req.body.title),
            ...req.body
        };
        const response = { pageTitle: 'Dashboard Edit Article', articleData: { ...updates, _id: req.params.id } }

        // Check data validation
        const validation = Article.validate(updates);
        if (validation.error) {
            if (file) deleteUploadedFile(join(process.env.UPLOAD_PATH, file.filename));
            return res.status(400).render('dashboard/articles/edit', { ...response, errMessage: validation.error.message });
        }

        // Check slug exists
        const result = await Article.findOne({ slug: updates.slug, _id: { '$ne': new ObjectId(req.params.id) } }, { projection: { _id: 1 } });
        if (result.status) return res.status(400).render('dashboard/articles/edit', { ...response, errMessage: "Title already used" });

        // Add projection. To return old cover_path value if there is a file uploaded
        let options = {};
        if (file) {
            updates.cover_path = `/${process.env.UPLOAD_PATH}/${req.authorData._id.toString()}/${file.filename}`;
            options.projection = { cover_path: 1 };
        }
        const updateResult = await Article.findOneAndUpdate({ _id: new ObjectId(req.params.id) }, updates, options);

        // Replace old cover with new one
        if (file) {
            const currentUploadedFile = join(process.env.UPLOAD_PATH, file.filename);
            const newPath = join(process.env.UPLOAD_PATH, req.authorData._id.toString(), file.filename);
            renameSync(currentUploadedFile, newPath);
            rmSync(join(updateResult.data.cover_path.slice(1)));
        }

        res.status(200).redirect(`/dashboard/article/${createSlug(updates.title)}`);
    } catch (error) {
        next(createError(500, error.message));
    }
}

const deleteArticle = async (req, res, next) => {
    const article = await Article.findOneAndDelete({ _id: new ObjectId(req.params.id) });
    deleteUploadedFile(join(article.cover_path.slice(1)));
    res.redirect('/dashboard');
}

module.exports = {
    createArticle,
    getArticle,
    getArticles,
    getAggregate,
    countArticles,
    updateArticle,
    deleteArticle
}