module.exports = (req, res, next) => {
    if (req.query.api_key == process.env.API_KEY) return next();
    return next(createError(400, "Api Key not valid"));
}