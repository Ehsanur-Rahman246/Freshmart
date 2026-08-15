import dns from "dns"
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose"

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("MONGODB CONNECTED SUCESSFULLY!");
    }catch (error){
        console.error("Error connecting to MONGODB", error);
    }
}