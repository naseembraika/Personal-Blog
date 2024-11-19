const { dbConnection } = require('../configurations')
const { hashSync, compareSync } = require('bcryptjs')
const { authorValidator } = require('../validators');
const { sign } = require('jsonwebtoken');

module.exports = class Author {
    static _collection = 'authors';

    constructor(authorData) {
        this.authorData = {
            name: authorData.name,
            username: authorData.username,
            password: hashSync(authorData.password),
            last_login: '',
            bio: 'New author on Clean Blog',
            description: 'Hi Visitors!'
        }
    }

    save(cb) {
        dbConnection(Author._collection, async (collection) => {
            try {
                await collection.insertOne(this.authorData);
                cb()
            } catch (error) {
                cb(error)
            }
        })
    }

    static findOne(filter, options) {
        return new Promise((resolve, reject) => {
            dbConnection(Author._collection, async (collection) => {
                try {
                    const data = await collection.findOne(filter, options);
                    return (data) ? resolve({ status: true, data }) : resolve({ status: false });
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static validate(type, data) {
        if (type == 'signup') return authorValidator.signup.validate(data);
        if (type == 'update') return authorValidator.updateData.validate(data);
        throw new Error("Choose type of validation");
    }

    static login(loginData) {
        return new Promise((resolve, reject) => {
            dbConnection(Author._collection, async (collection) => {
                try {
                    let author = await collection.findOne({ username: loginData.username });
                    if (!author || !compareSync(loginData.password, author.password)) return resolve({ status: false, message: 'check username or password' });

                    const token = sign({ _id: author._id, name: author.name }, process.env.JWT_SECRET_KEY);
                    await collection.updateOne({ _id: author._id }, { '$set': { 'last_login': new Date(), token } });
                    resolve({ status: true, token });
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static updateOne(filter, update, options) {
        return new Promise((resolve, reject) => {
            dbConnection(Author._collection, async (collection) => {
                try {
                    await collection.updateOne(filter, update, options);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

    static findOneAndUpdate(filter, update, options) {
        return new Promise((resolve, reject) => {
            dbConnection(Author._collection, async (collection) => {
                try {
                    const data = await collection.findOneAndUpdate(filter, { '$set': update }, options);
                    return (data) ? resolve({ status: true, data }) : resolve({ status: false });
                } catch (error) {
                    reject(error);
                }
            })
        })
    }

}