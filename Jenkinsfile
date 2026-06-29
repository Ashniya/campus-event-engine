pipeline {
    agent any

    environment {
        // Defines the name for the docker-compose project to avoid conflicts
        COMPOSE_PROJECT_NAME = 'campus-event-engine'
        // Pulls the MongoDB connection string securely from Jenkins Credentials
        MONGO_URI = credentials('MONGO_URI')
    }

    stages {
        stage('Checkout') {
            steps {
                // In a real Jenkins setup, it automatically checks out the code,
                // but you can explicitly clean the workspace here.
                checkout scm
                echo "Code checkout successful."
            }
        }
        
        stage('Build Images') {
            steps {
                // Builds the frontend and backend Docker images
                bat 'docker-compose build'
            }
        }
        
        stage('Deploy to AWS EC2') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'aws-ec2-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    // Fix Windows OpenSSH private key permissions (Warning: UNPROTECTED PRIVATE KEY FILE!)
                    bat '"C:\\Windows\\System32\\icacls.exe" "%SSH_KEY%" /grant:r "SYSTEM:F" /c'
                    bat '"C:\\Windows\\System32\\icacls.exe" "%SSH_KEY%" /inheritance:r /c'
                    
                    // Connect to AWS, install Docker & Git, do a fresh git clone directly from GitHub, and start containers!
                    bat '"C:\\Windows\\System32\\OpenSSH\\ssh.exe" -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@51.20.73.168 "sudo apt-get update && sudo apt-get install -y docker.io docker-compose git && cd ~ && rm -rf ~/campus-event-engine && git clone https://github.com/Ashniya/campus-event-engine.git && cd ~/campus-event-engine && sudo docker-compose down && sudo docker-compose up -d --build"'
                }
            }
        }
        
        stage('Verify Running Containers') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'aws-ec2-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    // Fix Windows OpenSSH private key permissions
                    bat '"C:\\Windows\\System32\\icacls.exe" "%SSH_KEY%" /grant:r "SYSTEM:F" /c'
                    bat '"C:\\Windows\\System32\\icacls.exe" "%SSH_KEY%" /inheritance:r /c'
                    
                    // Lists the running containers on AWS to verify they started successfully
                    bat '"C:\\Windows\\System32\\OpenSSH\\ssh.exe" -i "%SSH_KEY%" -o StrictHostKeyChecking=no %SSH_USER%@51.20.73.168 "sudo docker ps"'
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful! The Campus Event Engine is up and running.'
        }
        failure {
            echo 'Deployment failed. Please check the Jenkins logs to find the issue.'
        }
        always {
            // Optional: You could clean up unused docker resources here
            // sh 'docker system prune -f'
            echo 'Pipeline execution completed.'
        }
    }
}
