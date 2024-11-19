const { dbConnection } = require('../configurations')
const { articleValidator } = require('../validators')

module.exports = class Article {
    static _collection = 'articles';

    constructor(articleData) {
        this.articleData = articleData;
    }

    createArticle(cb) {
        dbConnection(Article._collection, async (collection) => {
            try {
                await collection.insertOne(this.articleData);
                cb();
            } catch (error) {
                cb(error)
            }
        })
    }

    static validate(articleData) {
        return articleValidator.validate(articleData);
    }

    static findOne(filter, options) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const data = await collection.findOne(filter, options);
                    return (data) ? resolve({ status: true, data }) : resolve({ status: false });
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static find(filter, options) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const data = await collection.find(filter, options).toArray();
                    return (data) ? resolve({ status: true, data }) : resolve({ status: false });
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static countDocuments(filter) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const count = await collection.countDocuments(filter);
                    resolve(count);
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static aggregate(query) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const data = await collection.aggregate(query).toArray();
                    return (data.length > 0) ? resolve({ status: true, data }) : resolve({ status: false });
                } catch (error) {
                    reject(error)
                }
            })
        })
    }

    static findOneAndUpdate(filter, update, options) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const data = await collection.findOneAndUpdate(filter, { '$set': update }, options);
                    return (data) ? resolve({ status: true, data }) : resolve({ status: false });
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static findOneAndDelete(filter) {
        return new Promise((resolve, reject) => {
            dbConnection(Article._collection, async (collection) => {
                try {
                    const data = await collection.findOneAndDelete(filter, { projection: { cover_path: 1 } });
                    return (data) ? resolve({ status: true, cover_path: data.cover_path }) : resolve({ status: false });
                } catch (error) {
                    reject(error)
                }
            })
        })
    }
}