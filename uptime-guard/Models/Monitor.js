const mongoose = require('mongoose');

const MonitorSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },

    url:{
        type: String,
        required: true
    },

    intervalSeconds:{
        type: Number,
        default: 30
    },

    status:{
        type: String,
        enum: ['UP', 'DOWN', 'PENDING'],
        default: 'PENDING'
    }
}, { timestamps: true } );

module.exports = mongoose.model('Monitor', MonitorSchema);