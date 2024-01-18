import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";




const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`, {
            // Other options...
        });
        console.log(`\n MongoDB Connected || DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGO DB CONNECTION ERROR !", error);
        process.exit(1);
    }
};

export default connectDB;


// import mongoose from "mongoose";
// import { DB_NAME } from "../constants.js";


// const connectDB = async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
//     } catch (error) {
//         console.log("MONGODB connection FAILED ", error);
//         process.exit(1)
//     }
// }

// export default connectDB



