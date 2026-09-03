require('dotenv').config();
const express = require('express')
const Monitor = require('./Models/Monitor')
const PingLog = require('./Models/PingLog')
const Incident = require('./Models/Incident')
const checkMonitor = require('./checker')
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');


//const connectDB = require('./index')

const app = express()
app.use(cors());
app.use(express.json())

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


io.on('connection', (socket) => {
  console.log(`⚡ Client connected via WebSocket: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);


//Get Monitor Websites
app.get('/api/monitors', async(req, res) => {

    try{
        const monitors = await Monitor.find()
        res.json(monitors)
    }catch(err){
        res.status(500).json({error: err.message})
    }

})

//Add New Website in Monitor Database for monitoring
app.post('/api/monitors', async(req, res) => {

    try{
        const {name, url, intervalSeconds} = req.body;
        const newMonitor = await Monitor.create({name, url, intervalSeconds})
        checkMonitor(newMonitor, io);
        res.status(201).json(newMonitor)
     }catch(err){
        res.status(400).json({error: err.message})
    }

})

//Get PingLog for monitor'id
app.get('/api/monitors/:id/log', async(req, res) =>{
    
    try{  
        const logs = await PingLog.find({monitorId: req.params.id}).sort({checkedAt: -1}).limit(50);
        res.json(logs)

    }catch(err){
        res.status(500).json({error: err.message})
    }
})

//Delete Monitor
app.delete('/api/monitors/:id', async(req, res) => {

    try{
        const updatedMonitorID = new mongoose.Types.ObjectId(req.params.id.trim());
        await Monitor.findByIdAndDelete(req.params.id)
        await PingLog.deleteMany({monitorId: updatedMonitorID})
        await Incident.deleteMany({monitorId: updatedMonitorID})

        io.emit('monitor_deleted', { monitorId: req.params.id });

        res.status(200).json("Monitor successfully deleted...")
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

//Get ALL Incidents
app.get('/api/incidents', async(req, res) => {
    try{
        const incidents = await Incident.find()
            .populate('monitorId', 'name url') 
            .sort({ startedAt: -1 })
            .limit(100);
        res.json(incidents)

    }catch(err){
        res.status(500).json({error: err.message})
    }
})


// Get aggregated stats for a single monitor
app.get('/api/monitors/:id/stats', async (req, res) => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const logs = await PingLog.find({
            monitorId: req.params.id,
            checkedAt: { $gte: twentyFourHoursAgo }
        });

        if (logs.length === 0) {
            return res.json({ uptimePercentage: 100, avgResponseTimeMs: 0, totalPings: 0 });
        }

        const upPings = logs.filter(l => l.isUp).length;
        const uptimePercentage = ((upPings / logs.length) * 100).toFixed(2);
        
        const totalMs = logs.reduce((acc, l) => acc + (l.responseTimeMs || 0), 0);
        const avgResponseTimeMs = Math.round(totalMs / logs.length);

        res.json({
            uptimePercentage: Number(uptimePercentage),
            avgResponseTimeMs,
            totalPings: logs.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Get Monitor By ID
app.get('/api/monitors/:id', async (req, res) => {
    try {
        const monitor = await Monitor.findById(req.params.id);
        if (!monitor) return res.status(404).json({ error: "Monitor not found" });
        res.json(monitor);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



const PING_INTERVAL_MS = 30000; 

setInterval(async () => {
    console.log('\n🔍 Running scheduled background ping checks...');
    try {
        const monitors = await Monitor.find();
        for (const monitor of monitors) {
            await checkMonitor(monitor, io);
            
        }
    } catch (err) {
        console.error('Error in background check loop:', err.message);
    }
}, PING_INTERVAL_MS);


module.exports = { app, server, io };