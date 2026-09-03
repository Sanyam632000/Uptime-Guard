const mongoose = require('mongoose');
const express = require('express')
require('dotenv').config();

const {server} = require('./server');


const connectDB = async () =>{
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Successfully Connected...`);
    }catch(err){
        console.error(`Mongo Failed To Connect: ${err.message}`);
        process.exit(1);
    }
}

connectDB()

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`🚀 UptimeGuard Server running on http://localhost:${PORT}`);
});

module.exports = connectDB;