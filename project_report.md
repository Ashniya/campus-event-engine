# Project Report: Campus Event Engine

## Table of Contents
- [Chapter 1 — Introduction](#chapter-1--introduction)
  - [1.1 Project Overview](#11-project-overview)
  - [1.2 Problem Statement](#12-problem-statement)
  - [1.3 Objectives](#13-objectives)
  - [1.4 Scope](#14-scope)
- [Chapter 2 — System Requirements](#chapter-2--system-requirements)
  - [2.1 Hardware Requirements](#21-hardware-requirements)
  - [2.2 Software Requirements](#22-software-requirements)
- [Chapter 3 — Workflow](#chapter-3--workflow)
- [Chapter 4 — Implementation](#chapter-4--implementation)
- [Chapter 5 — Results and Output](#chapter-5--results-and-output)
- [Chapter 6 — Future Scope](#chapter-6--future-scope)
- [Chapter 7 — Conclusion](#chapter-7--conclusion)

---

## Chapter 1 — Introduction

### 1.1 Project Overview
**Campus Event Engine** is a comprehensive web application designed to manage, organize, and track events within a university or college campus environment. The project is implemented using the MERN stack (MongoDB, Express.js, React, Node.js) and employs modern DevOps practices to ensure seamless integration, continuous delivery, and containerized deployment.

### 1.2 Problem Statement
Universities often struggle with fragmented communication and disorganized scheduling when hosting multiple events across different departments and student groups. There is a lack of a centralized platform where students and faculty can discover, manage, and register for events. Additionally, manual deployments for such platforms often lead to downtime, environmental inconsistencies, and operational overhead.

### 1.3 Objectives
- Develop a centralized platform for campus event management.
- Containerize the frontend, backend, and database using Docker to ensure consistent environments across development, testing, and production.
- Automate the build and deployment pipeline using Jenkins.
- Provide a scalable and reliable infrastructure for the application.

### 1.4 Scope
The scope of this DevOps project covers setting up version control using Git, containerizing the application using Docker and Docker Compose, creating an automated CI/CD pipeline using Jenkins, and deploying the MERN stack application. It does not include advanced cloud-native orchestration like Kubernetes in this iteration, focusing instead on reliable CI/CD with Docker.

---

## Chapter 2 — System Requirements

### 2.1 Hardware Requirements
- **Processor:** Intel Core i5 / AMD Ryzen 5 or higher
- **RAM:** Minimum 8 GB (16 GB recommended for running Docker and Jenkins simultaneously)
- **Storage:** Minimum 50 GB of free disk space (SSD preferred)
- **Network:** Stable internet connection for downloading dependencies and pulling Docker images.

### 2.2 Software Requirements
- **Operating System:** Windows 10/11, Linux (Ubuntu 20.04+), or macOS
- **Version Control:** Git
- **Containerization:** Docker Engine & Docker Compose
- **CI/CD Server:** Jenkins
- **Languages & Frameworks:** Node.js (v18+), React (v19), Express.js (v5)
- **Database:** MongoDB
- **Code Repository:** GitHub

---

## Chapter 3 — Workflow

1. **Source Code Management:** Developers write code for the frontend (React + Vite) and backend (Node + Express) and push the changes to a central GitHub repository.
2. **Continuous Integration (CI):** 
   - A webhook triggers a Jenkins pipeline upon a new commit to the main branch.
   - Jenkins pulls the latest code from the GitHub repository.
   - Dependencies for both frontend and backend are installed and validated.
3. **Containerization (Docker Build):**
   - Jenkins executes `docker-compose build` to create independent Docker images for the frontend, backend, and MongoDB database based on their respective `Dockerfile`s.
4. **Continuous Deployment (CD):**
   - The pipeline runs `docker-compose up -d` to deploy the newly built images in detached mode.
   - The application becomes accessible on defined ports (Frontend: 5173, Backend: 5000, MongoDB: 27017).
5. **Monitoring & Accessibility:** The Campus Event Engine is now successfully running in isolated containers, providing a reliable and accessible platform for users.

---

## Chapter 4 — Implementation

### Setup Steps & Configurations
1. **Repository Setup:** Initialize a Git repository and push the initial MERN stack codebase to GitHub.
2. **Docker Configuration:** 
   - Write a `Dockerfile` for the Node.js backend.
   - Write a `Dockerfile` for the React frontend.
   - Write a `docker-compose.yml` to orchestrate the backend, frontend, and a MongoDB container.
3. **Jenkins Setup:** 
   - Install Jenkins and the required plugins (Docker Pipeline, Git, GitHub Integration).
   - Create a Pipeline job in Jenkins and link it to the GitHub repository.
   - Configure a GitHub webhook to trigger the Jenkins build automatically on push events.

### Commands Used
```bash
# Clone the repository
git clone <GITHUB_REPO_URL>

# Build Docker images manually (for testing)
docker-compose build

# Run the containers in detached mode
docker-compose up -d

# Check running containers
docker ps

# Stop the containers
docker-compose down
```

### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```

### Jenkinsfile
```groovy
pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'campus-event-engine'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: '<GITHUB_REPO_URL>'
            }
        }
        
        stage('Build Images') {
            steps {
                sh 'docker-compose build'
            }
        }
        
        stage('Deploy') {
            steps {
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful! The application is up and running.'
        }
        failure {
            echo 'Deployment failed. Please check the logs.'
        }
    }
}
```

### GitHub Repo
*Repository URL:* `[Insert GitHub Repository Link Here]`

### Screenshots
*(Placeholders for Implementation Screenshots)*
- [Screenshot: Jenkins Pipeline Configuration]
- [Screenshot: GitHub Webhook Setup]

---

## Chapter 5 — Results and Output

The CI/CD pipeline was successfully implemented, resulting in automated, zero-touch deployments whenever new code is merged. 

### Output Screenshots
*(Please insert actual screenshots here)*
- **Successful Jenkins Build:** [Screenshot showing all pipeline stages passing in green]
- **Docker Image Creation:** [Screenshot of terminal showing `docker images` with the new frontend and backend images]
- **Running Container:** [Screenshot of terminal showing `docker ps` with backend, frontend, and mongo containers running]
- **Deployed App:** [Screenshot of the Campus Event Engine homepage loaded in a web browser at localhost:5173]

---

## Chapter 6 — Future Scope

- **Cloud Deployment:** Migrate the deployment from a local/standalone server to AWS (EC2/ECS) or Google Cloud.
- **Kubernetes Orchestration:** Implement Kubernetes to manage container scaling, self-healing, and load balancing instead of Docker Compose.
- **Automated Testing:** Integrate automated unit and integration tests (e.g., Jest, Cypress) into the Jenkins pipeline to ensure code quality before building the Docker images.
- **Image Registry:** Push built Docker images to Docker Hub or AWS ECR as part of the CI pipeline before pulling them for deployment.
- **Monitoring & Logging:** Integrate Prometheus and Grafana for monitoring container health and ELK stack for centralized logging.

---

## Chapter 7 — Conclusion

The Campus Event Engine DevOps project was successfully completed, achieving its primary objective of automating the build and deployment process for a full-stack web application. By implementing Docker containerization, we eliminated "it works on my machine" issues and ensured environmental consistency. The integration of Jenkins established a robust CI/CD pipeline, drastically reducing manual deployment efforts and minimizing downtime.

Through this project, key technologies were learned and applied, including **Docker, Docker Compose, Jenkins, Git, and CI/CD principles**, bridging the gap between development and operations. The final outcome is a scalable, containerized campus event platform that automatically updates itself upon new code commits, representing a highly efficient modern DevOps workflow.
