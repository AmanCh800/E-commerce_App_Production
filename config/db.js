import mongoose from "mongoose";

const connectDB = async function() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log("Successfully connected to Mongo database " + conn.connection.host);
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;