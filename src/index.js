
import connectDB from "./db/index";




connectDB()














// import express  from "express";
// const app = express();
// ;( async () => {
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//        app.on("error",(error)=> {
//         console.log("Not Talk To DataBase", error);
//         throw error
//        })

//        app.listen(process.env.PORT, ()=> {
//         console.log(`App is Listening on Port ${process.env.PORT}`);
//        })
//     } catch (error) {
//         console.log(error);
//     }
// })()