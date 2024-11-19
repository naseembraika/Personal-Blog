const { MongoClient } = require('mongodb')

const _uri = process.env.DATABASE_URI;

module.exports = (collection, callback) => {
    MongoClient.connect(_uri)
        .then(async (client) => {
            const db = client.db(process.env.DATABASE_NAME).collection(collection);
            await callback(db);
            client.close();
        })
}