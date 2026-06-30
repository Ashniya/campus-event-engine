# 🎓 Campus Event Engine

[![Deployment Status](https://img.shields.io/badge/Deployment-AWS_EC2-FF9900?logo=amazonaws)](http://51.20.73.168:5173)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-Jenkins-D33833?logo=jenkins)](http://51.20.73.168:5173)
[![Containers](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker)](http://51.20.73.168:5173)

### 🌍 **Live Demo:** [http://51.20.73.168:5173](http://51.20.73.168:5173)

**Campus Event Engine** is a comprehensive, full-stack web application designed to manage, organize, and track events within a university or college campus environment. It solves the problem of fragmented communication by providing a centralized, containerized platform for students and faculty to discover and register for events.

---

## 🛠️ Tech Stack & Infrastructure

- **Frontend:** React.js, Vite, Axios
- **Backend:** Node.js, Express.js, JWT Authentication
- **Database:** MongoDB Atlas
- **Containerization:** Docker & Docker Compose
- **CI/CD Pipeline:** Jenkins
- **Cloud Hosting:** AWS EC2 (Ubuntu)

---

## 🚀 DevOps & CI/CD Architecture

This project implements modern DevOps practices to ensure seamless integration, continuous delivery, and zero-touch deployments:

1. **Source Code Management:** All code is version-controlled via GitHub.
2. **Automated Jenkins Pipeline:** 
   - A `Jenkinsfile` orchestrates the entire deployment process.
   - Pushing to the `main` branch automatically triggers the Jenkins CI/CD pipeline.
3. **Secure Secret Management:** 
   - Sensitive environment variables (like the MongoDB Atlas connection string) are stored securely in Jenkins Credentials.
   - Jenkins injects these secrets dynamically into a `.env` file on the AWS server during deployment, preventing secrets from being exposed in source control.
4. **AWS EC2 Deployment:**
   - Jenkins securely SSHs into the AWS EC2 instance.
   - It performs a fresh `git clone`, injects secrets, and uses `docker-compose up -d --build` to orchestrate and serve the containers over the public internet.

---

## 💻 Running Locally

To run this project on your local machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ashniya/campus-event-engine.git
   cd campus-event-engine
   ```

2. **Set up Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```

4. **Access the application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`

---

## 📸 Features
- **Secure User Authentication:** JWT-based login and registration.
- **Dynamic API Routing:** Frontend automatically detects and routes API calls based on the current hostname (works locally and on AWS without code changes).
- **Event Management:** Create, view, and register for campus events.
- **Role-Based Access:** Support for Student and Admin roles.
