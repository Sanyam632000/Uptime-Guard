const Monitor = require("./Models/Monitor");
const PingLog = require("./Models/PingLog");
const Incident = require("./Models/Incident");
const axios = require("axios");
const mongoose = require('mongoose');
const { sendAlertEmail, sendRecoveryAlert } = require('./Services/emailService');

async function checkMonitor(monitor, io) {
    const startTime = Date.now();
    let isUp = false;
    let statusCode = null;
    let errorMessage = null;

    const currentMonitor = await Monitor.findById(monitor._id);
    if (!currentMonitor) return;


    try {

        const response = await axios.get(monitor.url, {timeout: 5000, validateStatus: () => true});

        const responseMs = Date.now() - startTime;
        statusCode = response.status;
        isUp = statusCode >= 200 && statusCode < 400;
        if (!isUp) {
            errorMessage = `HTTP Status ${statusCode}`;
        } 


        const newLog = await PingLog.create({
            monitorId: monitor._id,
            statusCode: statusCode,
            responseTimeMs: responseMs,
            isUp: isUp,
        })

        if (io) {
            const logToEmit = newLog.toObject();
            logToEmit.monitorId = logToEmit.monitorId.toString();
            io.emit('ping_log_added', logToEmit);
        }   

        //If status code is not in range [200,399] in PingLog, and website status is not down (either up or pending), then update status variable to "DOWN" in Monitor and Create an Incident log
        if (!isUp && monitor.status != 'DOWN'){
            currentMonitor.status = 'DOWN';
            //Monitor's Status is updated to "DOWN"
            await Monitor.findByIdAndUpdate(monitor._id, {status: 'DOWN'})

            //Incident Created
            await Incident.create({
                monitorId: monitor._id,     
                errorMessage: errorMessage
            })

            await sendAlertEmail(monitor.name, monitor.url, errorMessage);

        }
        //If status code in in range [200,399] in PingLog,  update status to UP and resolve incident (When website was crashed before and now UP again)
        else if (isUp && monitor.status == 'DOWN'){
            currentMonitor.status = 'UP';
            await Monitor.findByIdAndUpdate(monitor._id, {status: "UP"})

            const openIncident = await Incident.findOneAndUpdate({monitorId: monitor._id, resolvedAt: null}, {resolvedAt: new Date()})

            const downtimeMs = openIncident && openIncident.startedAt ? (Date.now() - new Date(openIncident.startedAt).getTime()) : 0;

            await sendRecoveryAlert(monitor.name, monitor.url, downtimeMs)

        }
        //if status code in in range [200,399] in PingLog, and status is PENDING, then update status to UP. Mostly, used in first run of PingLog.
        else if (isUp && monitor.status !== 'UP') {
            await Monitor.findByIdAndUpdate(monitor._id, { status: 'UP' });
        }

        if (io) {
            io.emit('monitor_ping', {
                monitorId: monitor._id.toString(),
                status: currentMonitor.status,
                isUp,
                statusCode,
                responseTimeMs: responseMs,
                checkedAt: newLog.checkedAt
            });
        }



    }catch (err) {
        
        const responseMs = Date.now() - startTime;

        const newLog = await PingLog.create({
            monitorId: monitor._id,
            statusCode: null,
            responseTimeMs: responseMs,
            isUp: false
        })

        if (io) {
            const logToEmit = newLog.toObject();
            logToEmit.monitorId = logToEmit.monitorId.toString();
            io.emit('ping_log_added', logToEmit);
        }

        if (monitor.status != "DOWN"){
            currentMonitor.status = 'DOWN';
            await Monitor.findByIdAndUpdate(monitor._id, {status:"DOWN"})

            await Incident.create({
                monitorId: monitor._id,
                errorMessage: err.message
            })

            await sendAlertEmail(monitor.name, monitor.url, err.message)
        }

        if (io) {
            io.emit('monitor_ping', {
                monitorId: monitor._id.toString(),
                status: currentMonitor.status,
                isUp: false,
                statusCode: null,
                responseTimeMs: responseMs,
                checkedAt: newLog.checkedAt
            });
        }
    }

}

module.exports = checkMonitor