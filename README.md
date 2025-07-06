# Angular Task Manager

A modern task management application built with Angular frontend and Java Spring Boot backend.

## Overview

This task manager application provides a user-friendly interface for managing daily tasks and activities. It combines the power of Angular's dynamic frontend with a robust Java Spring Boot backend.

## Project Structure

The project is organized into two main directories:

- `frontend/` - Angular application
- `backend/` - Java Spring Boot application

## Technologies Used

### Frontend
- Angular
- TypeScript
- HTML/CSS
- Angular Material (UI Components)

### Backend
- Java Spring Boot
- Maven (Build Tool)
- Spring Data JPA
- Spring Security

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js (v20 or higher)
- Java JDK 11 or higher
- Maven
- Angular CLI

## Getting Started

### Running the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build and run the Spring Boot application:
```bash
./mvnw spring-boot:run
```

The backend server will start on `http://localhost:8080`

### Running the Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

The application will be available at `http://localhost:4200`

## Features

- User Authentication and Authorization
- Create, Read, Update, and Delete Tasks
- Task Categories and Priority Levels
- Task Due Dates and Reminders
- Task Status Tracking
- Responsive Design for Mobile and Desktop

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries or suggestions, please open an issue in the repository.
