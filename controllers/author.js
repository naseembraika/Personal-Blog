const { Author } = require('../models')
const { rmSync, existsSync, mkdirSync, renameSync } = require('fs')
const { join } = require('path')
const { sign } = require('jsonwebtoken')

const getAuthorData = (filter, options) => Author.findOne(filter, options);

const deleteUploadedFile = (path) => rmSync(path);
const updateAuthorData = async (req, res, next) => {
    try {
        const file = req.file;
        let updates = req.body;
        const response = { author: updates, pageTitle: 'Dashboard | Edit Author Profile' };
        let projection = {};

        const validation = Author.validate('update', updates);
        if (validation.error) {
            if (file) deleteUploadedFile(join(process.env.UPLOAD_PATH, file.filename));
            return res.status(400).render('dashboard/authors/edit_profile', { ...response, message: validation.error.message });
        }

        // Check username exists
        const existsResult = await Author.findOne({ _id: { '$ne': req.authorData._id }, username: updates.username });
        if (existsResult.status) {
            if (file) deleteUploadedFile(join(process.env.UPLOAD_PATH, file.filename));
            return res.status(400).render('dashboard/authors/edit_profile', { ...response, message: "username already used" });
        }
        if (updates.username != req.authorData.username) {
            const token = sign({ _id: req.authorData._id, name: updates.name }, process.env.JWT_SECRET_KEY);
            updates.token = token;
        }

        // Insert uploaded cover to author dir path
        if (file) {
            const currentUploadedFile = join(process.env.UPLOAD_PATH, file.filename);
            const newPath = join(process.env.UPLOAD_PATH, req.authorData._id.toString(), file.filename);
            if (!existsSync(join(process.env.UPLOAD_PATH, req.authorData._id.toString()))) mkdirSync(join(process.env.UPLOAD_PATH, req.authorData._id.toString()))
            renameSync(currentUploadedFile, newPath);
            projection.profile_cover = 1;
            updates.profile_cover = `/${newPath.replaceAll('\\', '/')}`;
        }

        const updateResult = await Author.findOneAndUpdate({ _id: req.authorData._id }, updates, { projection });
        if (updates.profile_cover && updateResult.data.profile_cover) deleteUploadedFile(join(updateResult.data.profile_cover.slice(1)));
        if (updates.token) {
            res.clearCookie('token');
            res.cookie('token', `Bearer ${updates.token}`);
        }
        res.status(200).redirect('/dashboard');
    } catch (error) {
        if (req.file) deleteUploadedFile(join(process.env.UPLOAD_PATH, req.file.filename));
        next(createError(500, error.message));
    }
}

const signup = async (req, res, next) => {
    try {
        const signupData = req.body;
        const renderData = { signupData, pageTitle: 'Dashboard | Sign Up', headSection: 'Sign Up' }

        const validateResult = Author.validate('signup', signupData);
        if (validateResult.error) return res.status(400).render('auth/signup', { ...renderData, errMessage: validateResult.error.message });

        const userNameExists = await Author.findOne({ username: signupData.username }, { projection: { username: 1 } });
        if (userNameExists.status) return res.status(400).render('auth/signup', { ...renderData, errMessage: 'Username Already Exists' });

        const author = new Author(signupData);
        author.save((error) => {
            if (error) return next(createError(500, error.message));
            res.status(201).redirect('/auth/login');
        })
    } catch (error) {
        next(createError(500, error.message));
    }
}

const login = async (req, res, next) => {
    try {
        const renderData = { pageTitle: 'Dashboard | Login', headSection: 'Login' };
        const loginResult = await Author.login(req.body);
        if (!loginResult.status) return res.status(400).render('auth/login', { ...renderData, errMessage: loginResult.message });
        res.cookie('token', `Bearer ${loginResult.token}`);
        res.status(200).redirect('/dashboard');
    } catch (error) {
        next(createError(500, error.message));
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('token');
        await Author.updateOne({ _id: req.authorData._id }, { '$unset': { token: '' } });
        res.redirect('/auth/login');
    } catch (error) {
        next(createError(500, error.message));
    }
}

module.exports = {
    getAuthorData,
    updateAuthorData,
    signup,
    login,
    logout
}