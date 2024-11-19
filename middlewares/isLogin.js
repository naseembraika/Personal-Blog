module.exports = (req, res, next) => {
    const token = req.cookies['token'];
    return (token && token != '') ? res.redirect('/dashboard') : next();
}