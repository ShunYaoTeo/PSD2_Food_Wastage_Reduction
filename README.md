# PSD2 Food Wastage Reduction Project

This project aims to reduce food wastage by implementing a system with microservices. The project is built using the following technologies:

- Minikube v1.29.0
- npm 8.15.0
- Node 16.17.1
- Kubernetes Kustomize v4.5.7
- Docker Desktop
- MySQL
- Python
- K9S

## Microservices

The project consists of the following microservices:

1. Auth Service
2. FoodWasteCollection Service
3. Gateway Service
4. RabbitMQ
5. RewardManagement Service

## Getting Started

### Prerequisites

- Make sure to have Minikube and kubectl installed.
- Git pull the project from the GitHub repository: [https://github.com/ShunYaoTeo/PSD2_Food_Wastage_Reduction](https://github.com/ShunYaoTeo/PSD2_Food_Wastage_Reduction)

### Initializing the Database

Before running the microservices, you need to execute the `init.sql` files in the following order:

1. Auth
2. FoodWasteCollection
3. RewardManagement

### Running the Microservices

1. Run: `start minikube`
2. For each microservice (Auth, FoodWasteCollection, Gateway, Rabbit, RewardManagement):
   1. Change directory to the service's manifest directory: `cd <service>/manifest`
   2. Run: `kubectl apply -f ./`
3. Check if the services are running using K9S: `k9s`
4. Finally, enable gateway and rabbitmq connection with `minikube tunnel` on another commandline.
5. View rabbitMQ manage dashboard at: http://rabbitmq-manager.com/

### Running the React Website

1. Change directory to the client's "material-kit-react-main" directory: `cd client/material-kit-react-main`
2. Run: `npm run dev`
3. Once the server is running, access the website at [localhost:3000](http://localhost:3000)

### Running the ELK Stack for Logging and Monitoring

1. Change directory to the ELK directory: `cd ELK`
2. Run Elasticsearch pod by running `kubectl apply -f es-deployment-service.yaml`
3. Run Kibana pod by running `kubectl apply -f kibana-deployment-service.yaml`
4. Run nginx-log-generator pod by running `kubectl apply -f nginx-log-generator-deployment.yaml`
5. Run Filebeat pod by running `kubectl apply -f filebeat-deployment.yaml`
6. Open another command line window and execute: `kubectl port-forward service/es-master-service 9200:9200 -n elk`
7. Open another command line window and execute: `kubectl port-forward service/kibana-service 5601:5601 -n elk`
8. Access the Kibana dashboard at [localhost:5601](http://localhost:5601)


## Contributors
1	MATHAN S/O NANTHABALA	2100605 
<br/>
2	TONG KAH JUN	2101694
<br/>
3	AARON POH ZHENG RONG	2101557
<br/>
4	TEO SHUN YAO	2101104
<br/>
5	ALASTAIR LEE MING HAN	2101034

