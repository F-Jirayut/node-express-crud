## Technologies Used

- **Backend**: Node.js, Express.js  
- **Database**: PostgreSQL, Sequelize  
- **Containerization**: Docker, Docker Compose  
- **Others**: Redis

---

## Installation Guide

Follow these steps to set up the project:

1. **Clone the Repository**  
    git clone repository-url
    cd repository-name
2. **Set Up Environment Files**
    cp .env.example .env
    cp src/.env.example src/.env
3. **Build Docker Containers**
    docker-compose build
4. **Run Database Migrations**
    npx sequelize-cli db:migrate
5. http://localhost:3000