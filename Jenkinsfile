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
                sshagent(['aws-ec2-key']) {
                    // 1. Ensure the destination directory exists on AWS and install docker if needed
                    bat 'ssh -o StrictHostKeyChecking=no ubuntu@51.20.73.168 "mkdir -p ~/campus-event-engine && sudo apt-get update && sudo apt-get install -y docker.io docker-compose"'
                    
                    // 2. Copy your project files to the AWS server
                    bat 'scp -o StrictHostKeyChecking=no -r ./* ubuntu@51.20.73.168:/home/ubuntu/campus-event-engine'
                    
                    // 3. Start the Docker containers on AWS
                    bat 'ssh -o StrictHostKeyChecking=no ubuntu@51.20.73.168 "cd ~/campus-event-engine && sudo docker-compose down && sudo docker-compose up -d --build"'
                }
            }
        }
        
        stage('Verify Running Containers') {
            steps {
                sshagent(['aws-ec2-key']) {
                    // Lists the running containers on AWS to verify they started successfully
                    bat 'ssh -o StrictHostKeyChecking=no ubuntu@51.20.73.168 "sudo docker ps --filter \'name=campus-event-engine\'"'
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
