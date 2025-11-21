const { connect, connection } = require('mongoose');

const connectDB = async () => {
    await connect('mongodb://localhost:27017/cli-mongodb-app')
};

connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
});

module.exports = {
    connectDB,
    connection
}