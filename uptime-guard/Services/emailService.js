const nodemailer = require("nodemailer")
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})


async function sendAlertEmail(monitorName, monitorURL, errorMessage){
    
    const mail = {
        from: "Uptime Alert",
        to: process.env.RECIPIENT_EMAIL,
        subject: `🚨 CRITICAL ALERT: ${monitorName} is DOWN!`,
        html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                <h2 style="color: #e53e3e; margin-top: 0;">🚨 Outage Detected</h2>
                <p>Your monitored service <strong>${monitorName}</strong> has stopped responding.</p>
                <table style="width: 100%; text-align: left; margin: 15px 0; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0;"><strong>URL:</strong></td><td><a href="${monitorURL}">${monitorURL}</a></td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Status:</strong></td><td><span style="color: red; font-weight: bold;">DOWN</span></td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Error:</strong></td><td><code>${errorMessage}</code></td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Detected At:</strong></td><td>${new Date().toUTCString()}</td></tr>
                </table>
                <p style="color: #718096; font-size: 12px; margin-bottom: 0;">This is an automated system notification from UptimeGuard.</p>
            </div>
        `
    }

    try{
        await transporter.sendMail(mail)
        console.log(`📧 Email alert sent to ${process.env.RECIPIENT_EMAIL}`);
    } catch (error) {
        console.error('❌ Failed to send email alert:', error.message);
    }
}


async function sendRecoveryAlert(monitorName, monitorUrl, downtimeDurationMs) {
    const minutes = Math.round(downtimeDurationMs / 1000 / 60);
    const mail = {
        from: "UptimeGuard Alert",
        to: process.env.RECIPIENT_EMAIL,
        subject: `✅ RESOLVED: ${monitorName} is back UP`,
        html: `
            <div style="font-family: Arial, sans-serif; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                <h2 style="color: #38a169; margin-top: 0;">✅ Service Restored</h2>
                <p>Your monitored service <strong>${monitorName}</strong> is operational again.</p>
                <table style="width: 100%; text-align: left; margin: 15px 0; border-collapse: collapse;">
                    <tr><td style="padding: 6px 0;"><strong>URL:</strong></td><td><a href="${monitorUrl}">${monitorUrl}</a></td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Status:</strong></td><td><span style="color: green; font-weight: bold;">UP</span></td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Approx. Downtime:</strong></td><td>${minutes} minute(s)</td></tr>
                    <tr><td style="padding: 6px 0;"><strong>Resolved At:</strong></td><td>${new Date().toUTCString()}</td></tr>
                </table>
            </div>
        `
    };

    try {
        await transporter.sendMail(mail);
        console.log(`📧 Recovery email sent to ${process.env.RECIPIENT_EMAIL}`);
    } catch (error) {
        console.error('❌ Failed to send recovery email:', error.message);
    }
}

module.exports = { sendAlertEmail, sendRecoveryAlert };