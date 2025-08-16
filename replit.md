# Overview

This is a task management web application built with Flask and SQLAlchemy. It provides a clean, modern interface for users to create, manage, and organize their tasks with features like priority levels, completion tracking, due dates, and filtering capabilities. The application uses a REST API architecture with a responsive Bootstrap frontend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Backend Architecture
- **Framework**: Flask web framework with SQLAlchemy ORM for database operations
- **Database**: PostgreSQL with SQLAlchemy models for data persistence
- **API Design**: RESTful API endpoints under `/api/` namespace for task operations
- **Application Structure**: Modular design with separate files for models, routes, and main application setup
- **Configuration**: Environment-based configuration using environment variables for database URL and session secrets

## Frontend Architecture
- **Template Engine**: Jinja2 templates with Flask's built-in templating
- **CSS Framework**: Bootstrap with Replit's dark theme for consistent styling
- **JavaScript**: Vanilla JavaScript with a TaskManager class for client-side functionality
- **Responsive Design**: Mobile-first approach using Bootstrap's grid system
- **Icons**: Font Awesome for consistent iconography

## Data Model
- **Task Entity**: Core model with fields for title, description, completion status, timestamps, due dates, and priority levels
- **Priority System**: Three-tier priority system (low, medium, high) with visual indicators
- **Timestamps**: Automatic tracking of creation and update times
- **Data Serialization**: Built-in `to_dict()` method for JSON API responses

## Authentication & Security
- **Session Management**: Flask sessions with environment-based secret key
- **Input Validation**: Client-side and server-side validation for task data
- **Error Handling**: Comprehensive error handling with user-friendly messages

# External Dependencies

## Python Packages
- **Flask**: Web framework for handling HTTP requests and responses
- **Flask-SQLAlchemy**: ORM integration for database operations
- **Werkzeug**: WSGI utilities including ProxyFix for deployment

## Frontend Libraries
- **Bootstrap**: CSS framework with Replit's dark theme variant
- **Font Awesome**: Icon library for UI elements

## Database
- **PostgreSQL**: Primary database for task storage and management
- **SQLAlchemy**: Database abstraction layer with connection pooling

## Infrastructure
- **Environment Variables**: Used for database URL and session configuration
- **WSGI Deployment**: ProxyFix middleware for proper URL generation in production