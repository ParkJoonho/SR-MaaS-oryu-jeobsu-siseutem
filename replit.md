# Overview

This is the SR-MaaS Integrated Information System Error Management System, built with a React frontend (Vite + TypeScript) and Express.js backend. The application provides comprehensive error reporting and tracking capabilities with AI-powered features including intelligent title generation, system classification, voice recognition input, and image analysis using Google Gemini API. Users can submit error reports through voice input or traditional text entry, while administrators can manage and track error resolution progress through a comprehensive dashboard with real-time charts and statistics.

## Recent Changes (August 20, 2025)

### Offline Authentication System (Latest)
- Implemented dual authentication system supporting both online and offline modes
- Added offline authentication with local username/password system
- Created automatic admin account generation for offline environments
- Enhanced system compatibility for environments without internet connectivity
- Added environment variable controls for authentication mode selection

### Voice Recognition Integration
- Implemented Google Web Speech API for Korean voice recognition (ko-KR)
- Added voice-to-text conversion with microphone button UI
- Integrated automatic system classification after voice recognition completion
- Added error handling for microphone permissions and browser compatibility

### UI/UX Improvements  
- Replaced all bug icons with SRT logo for consistent branding
- Enhanced voice recording UI with animated microphone states
- Improved user feedback with toast notifications for voice recognition errors

### AI Enhancement
- Enhanced system classification to trigger automatically after voice input
- Added retry mechanisms for Gemini API overload situations
- Improved AI-powered title generation and system categorization accuracy

### AI Model Migration
- Migrated from Google Gemini API to Gemma-2-2B model via Hugging Face API
- Implemented CPU-based local keyword analysis for faster processing
- Added hybrid approach: local keyword classification + AI fallback
- Enhanced offline capabilities with keyword-based title generation
- Maintained compatibility with existing API endpoints

# User Preferences

Preferred communication style: Simple, everyday language.

## Offline Authentication Requirements
- System must support offline operation without internet connectivity
- Local username/password authentication as fallback for Replit Auth
- Automatic admin account creation for isolated environments
- Environment-based authentication mode switching

# System Architecture

## Frontend Architecture
The client uses a modern React stack with Vite as the build tool and TypeScript for type safety. The UI is built with shadcn/ui components based on Radix UI primitives and styled with Tailwind CSS. State management is handled through TanStack React Query for server state and React Hook Form for form management. The routing system uses Wouter for client-side navigation.

**Key Design Decisions:**
- **Component Library**: Chose shadcn/ui for consistent, accessible components with extensive Radix UI integration
- **Styling**: Tailwind CSS with CSS variables for theming support and consistent design tokens
- **State Management**: TanStack React Query eliminates the need for additional state management libraries by handling server state efficiently
- **Form Handling**: React Hook Form with Zod validation provides type-safe form management with minimal re-renders

## Backend Architecture
The server implements a RESTful API using Express.js with TypeScript. Authentication is handled through Replit's OpenID Connect integration with session-based storage. The application follows a layered architecture with separate concerns for routing, data access, and business logic.

**Key Design Decisions:**
- **Database Layer**: Drizzle ORM provides type-safe database operations with PostgreSQL
- **Authentication**: Replit OpenID Connect ensures secure user authentication within the Replit environment
- **Session Management**: PostgreSQL-backed sessions provide persistent login state across server restarts
- **API Design**: RESTful endpoints with consistent error handling and logging middleware

## Database Design
Uses PostgreSQL with Drizzle ORM for type-safe database operations. The schema includes user management tables required for Replit Auth integration and error tracking tables for the core functionality.

**Table Structure:**
- **users**: Stores user profile information from Replit Auth
- **sessions**: Session storage required for authentication persistence
- **errors**: Core error reporting data with status tracking and metadata

## Authentication & Authorization
Implements Replit's OpenID Connect authentication system with session-based authorization. The system requires users to be authenticated to access any functionality beyond the landing page.

**Security Features:**
- OpenID Connect integration with Replit's identity provider
- Session-based authentication with PostgreSQL storage
- Middleware-based route protection
- Secure cookie configuration for production environments

# External Dependencies

## Core Infrastructure
- **Neon Database**: Serverless PostgreSQL database with `@neondatabase/serverless` driver for connection pooling
- **Replit Authentication**: OpenID Connect integration using `openid-client` and `passport` strategies

## AI Integration
- **Google Gemini API**: Gemini-2.5-flash model integration for intelligent error title generation based on error content analysis

## UI Components & Styling
- **Radix UI**: Comprehensive component library (`@radix-ui/*`) providing accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Chart.js**: Data visualization library for dashboard analytics and error statistics

## Development Tools
- **Vite**: Frontend build tool with React plugin and development server
- **Drizzle**: Type-safe ORM with migration support and PostgreSQL dialect
- **React Hook Form**: Form state management with Zod schema validation
- **TanStack React Query**: Server state management and caching solution