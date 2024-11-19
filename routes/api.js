const { Router } = require('express');
const { getArticles, getAggregate } = require('../controllers/article')
const { auth, apiAuth } = require('../middlewares')

const router = Router();

router.get('/dashboard/load-articles', auth, apiAuth, async (req, res, next) => {
    try {
        const options = { sort: { created_at: -1 }, limit: 3, skip: Number(req.query.skip) };
        const result = await getArticles({ _author_id: req.authorData._id }, options);
        if (result.data.length == 0) return res.status(200).json({ status: false });
        res.status(200).json({ status: true, data: result.data });
    } catch (error) {
        next(createError(500, error.message));
    }
})

router.get('/blog/load-articles', apiAuth, async (req, res, next) => {
    try {
        const result = await getAggregate([
            {
                '$lookup': {
                    from: 'authors',
                    localField: '_author_id',
                    foreignField: '_id',
                    as: 'author',
                }
            },
            { '$sort': { created_at: -1 } },
            { '$skip': Number(req.query.skip) },
            { '$limit': 3 },
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
            }
        ]);
        if (!result.status) return res.status(200).json({ status: false });
        res.status(200).json({ status: true, data: result.data });
    } catch (error) {
        next(createError(500, error.message));
    }
})

module.exports = router;