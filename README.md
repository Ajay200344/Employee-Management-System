# Employee Management System

A full-stack web application for managing employee information.

## Overview

The application allows users to view employee information, while ADMIN users can add, update, and delete employee records.

The frontend is built with HTML, CSS, and JavaScript. The backend is developed using Java and Spring Boot with REST APIs. MySQL is used as the database.

## Features

* User registration and login
* JWT-based authentication
* Spring Security
* Role-based authorization
* ADMIN and USER roles
* ADMIN can add, view, update, and delete employees
* USER can view employees
* JWT token refresh and logout

## Technologies Used

**Frontend**

* HTML
* CSS
* JavaScript

**Backend**

* Java
* Spring Boot
* Spring Data JPA
* Spring Security
* JWT
* REST API

**Database**

* MySQL

**Tools**

* IntelliJ IDEA
* Visual Studio Code
* MySQL Workbench
* Postman
* Git & GitHub

## Database

Database: `employee_db`

Tables:

* `users`
* `employees`

## API Endpoints

### Authentication

| Method | Endpoint    | Description         |
| ------ | ----------- | ------------------- |
| POST   | `/register` | Register a new user |
| POST   | `/login`    | Login               |
| POST   | `/logout`   | Logout              |
| POST   | `/refresh`  | Refresh JWT token   |

### Employee

Employee APIs are available under:

`/employees`

Access is controlled using Spring Security and user roles.

## Running the Project

### Backend

Run the Spring Boot application on:

`http://localhost:8081`

### Frontend

Run the frontend using a local server on:

`http://localhost:5500`

Make sure MySQL is running and the `employee_db` database is configured before starting the application.
