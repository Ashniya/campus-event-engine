pipeline {
    agent any

    environment {
        // Defines the name for the docker-compose project to avoid conflicts
        COMPOSE_PROJECT_NAME = 'campus-event-engine'
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
                sh 'docker-compose build'
            }
        }
        
        stage('Deploy') {
            steps {
                // Stops any running instances of this project and restarts them
                sh 'docker-compose down'
                sh 'docker-compose up -d'
            }
        }
        
        stage('Verify Running Containers') {
            steps {
                // Lists the running containers to verify they started successfully
                sh 'docker ps --filter "name=campus-event-engine"'
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
