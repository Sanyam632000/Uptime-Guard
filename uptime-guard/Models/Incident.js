const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
    monitorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Monitor',
        required: true
    },

    startedAt:{
        type: Date, 
        default: Date.now
    },

    resolvedAt:{
        type: Date,
        default: null
    },

    errorMessage:{
        type: String,
        default: ''
    }
})

module.exports = mongoose.model('Incident', IncidentSchema);