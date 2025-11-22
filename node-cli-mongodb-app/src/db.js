const { connect, connection } = require('mongoose');
const { MONGODB_URI } = require('./config');

const connectDB = async () => {
    await connect(MONGODB_URI)
};

connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(1);
});

module.exports = {
    connectDB,
    connection
}