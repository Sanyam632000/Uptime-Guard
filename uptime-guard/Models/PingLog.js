const mongoose = require('mongoose');

const PingLogSchema = new mongoose.Schema({
    monitorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Monitor',
        required: true
    },

    statusCode:{
        type: Number,
        default: null
    },

    responseTimeMs :{
        type: Number,
        required: true
    }, 

    isUp:{
        type: Boolean,
        required: true
    },

    checkedAt:{
        type: Date,
        default: Date.now
    }
})

PingLogSchema.index({ monitorId: 1, checkedAt: -1 });

module.exports = mongoose.model('PingLog', PingLogSchema);
