# Uptime & Service Health Monitor

A lightweight, real-time web application designed to monitor service availability, track API endpoint status, and display performance latency metrics. 

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌐 Live Application

**You can access and test the deployed application here: ** 
👉 **[Uptime Monitor Live Demo](https://uptime-guard-frontend.onrender.com)**

https://uptime-guard-frontend.onrender.com
---

## 📌 Overview

This tool provides continuous monitoring for web services and APIs. It periodically checks configured endpoints to measure response times, log status codes, and visually signal service health. It is built to bridge technical infrastructure tracking with non-technical usability—allowing anyone to instantly assess system status without reading server logs.

---

## ✨ Key Features

* **Real-Time Health Tracking:** Continuous background checks to monitor site availability.
* **Latency & Response Metrics:** Tracks HTTP response codes and round-trip ping times (ms).
* **At-a-Glance Visual Indicators:** Intuitive, color-coded status badges (Green = Operational, Red = Outage/Issue).
* **Non-Technical Dashboard:** A clean user interface designed for non-technical stakeholders to quickly verify uptime.

---

## 🛠️ Tech Stack

* **Front-End:**  React / JavaScript, Tailwind CSS
* **Back-End:**   Node.js, Express, Socket.io
* **Database:**   MongoDB 
* **Deployment:** Hosted on  Render

---

## 👤 How a Non-Technical User Can Use & Manage This Tool

You do not need programming knowledge to inspect or understand system health using this dashboard:

1. **Check System Health:** Look at the main status panel. A **Green** badge indicates all systems are fully operational; a **Red** badge alerts you to a service interruption.
2. **Review Performance:** View response times in milliseconds to check if a website is loading slowly before an outage occurs.
3. **Adding a New Site/Endpoint:** *(If implemented)* Click the **"Add Endpoint"** button on the dashboard, enter the website address (URL), and click save. The tool will begin monitoring it automatically.

---

## 🚀 Quickstart (Local Installation)

To run this project locally on your machine:

```bash
# 1. Clone the repository
git clone [https://github.com/your-username/uptime-monitor.git](https://github.com/your-username/uptime-monitor.git)

# 2. Navigate to the project directory
cd uptime-monitor

# 3. Install dependencies
npm install

# 4. Start the development server
npm start

