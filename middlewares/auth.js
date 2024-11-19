const { verify } = require('jsonwebtoken')
const { findOne: findAuthor } = require('../models/Author');
const { ObjectId } = require('mongodb');

module.exports = async (req, res, next) => {
    let token = req.cookies.token;

    if (token == undefined || token == '') return res.status(401).redirect('/auth/login');

    token = token.split(' ')[1];
    try {
        const decodeToken = verify(token, process.env.JWT_SECRET_KEY);
        const searchResult = await findAuthor({ _id: new ObjectId(decodeToken._id), token }, { projection: { _id: 1, name: 1, username: 1 } });
        const renderData = { pageTitle: 'Dashboard | Login', headSection: 'Login', errMessage: searchResult.message };
        if (!searchResult.status) return res.status(403).render('auth/login', renderData);
        req.authorData = searchResult.data;
        next();
    } catch (error) {
        return res.status(403).redirect('/auth/login');
    }
}