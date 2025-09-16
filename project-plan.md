# Project Plan: Content Sharing Platform

## 1. Project Summary (for LLM Context)

This project is a full-stack content-sharing platform built with Next.js, TypeScript, and Tailwind CSS. The backend uses Next.js API Routes with MongoDB for data storage and Redis (Upstash) for caching and rate limiting. The application is containerized with Docker and deployed on Google Cloud Run via a Cloud Build CI/CD pipeline. The core functionality allows users to publicly share content snippets, with plans to add user accounts, private sharing, and more advanced features in future phases.

---

## 2. Completed Foundations

This section outlines the core infrastructure and features that are already implemented and stable.

- [x] **Containerization & Orchestration**
    - [x] Multi-stage `Dockerfile` for optimized development and production builds.
    - [x] `docker-compose.dev.yml` for local development environment setup.
- [x] **Cloud Deployment (CI/CD)**
    - [x] Google Cloud Build pipeline (`cloudbuild.yaml`) for automated builds.
    - [x] Automated deployment to Google Cloud Run.
    - [x] Secret management for production environment variables.
- [x] **Backend Core**
    - [x] API endpoint for content creation (`/api/sharecontent/createcontent`).
    - [x] API endpoint for retrieving content (`/api/sharecontent/getcontent`).
    - [x] MongoDB integration with Mongoose schema (`contentModel.js`).
    - [x] Redis integration for API rate limiting (`@upstash/ratelimit`).
    - [x] Redis integration for caching (`lib/cache.ts`).
- [x] **Frontend Foundation**
    - [x] Next.js 14 project setup with App Router.
    - [x] Styling with Tailwind CSS.
    - [x] UI components from `shadcn/ui`.
    - [x] Light/Dark mode theme provider.

---

## 3. Phase 1: Public Sharing & Core UI (In Progress)

This phase focuses on refining the public-facing user interface and core user experience.

- [ ] **Landing Page Rework**
    - [ ] Design and implement a new, professional landing page component to replace the current placeholder.
    - [ ] Source and add distinct, high-quality images for the light and dark themes on the landing page.
- [ ] **Navigation Rework**
    - [ ] Remove the current bottom navigation from the root (`/`) layout for mobile users.
    - [ ] Implement a new bottom navigation bar with the following items:
        - [ ] Home
        - [ ] Code
        - [ ] Upload
        - [ ] Profile
- [ ] **Feature Pages Implementation**
    - [ ] **Home Page:** Develop the `home` page to show a feed of the latest publicly shared content.
    - [ ] **Code Page:**
        - [ ] Create a new page at `/code` that displays all public content.
        - [ ] Implement pagination to browse through shared content.
        - [ ] Add a toggle/filter for temporary vs. permanent content.
    - [ ] **Upload Page:** Create a dedicated page/view for the content upload functionality, expanding on the current dialog.
    - [ ] **Profile Page:** Create a basic profile page that shows content shared by the current user (or from local session if not logged in).
- [ ] **General UI/UX Cleanup**
    - [ ] Remove any redundant UI elements (e.g., "refresh button" or other placeholders).
    - [ ] Ensure a consistent and polished user experience across the new pages.

---

## 4. Phase 2: User Accounts & Advanced Features (Pending)

This phase introduces user authentication and advanced content sharing capabilities.

- [ ] **User Authentication**
    - [ ] Implement user login and registration (e.g., using NextAuth.js).
    - [ ] Create a new database model for users.
    - [ ] Protect routes and API endpoints based on authentication status.
- [ ] **User Dashboard**
    - [ ] Create a dashboard for logged-in users to manage their shared content (view, edit, delete).
- [ ] **Private & Secure Sharing**
    - [ ] Implement functionality for users to create private content.
    - [ ] Add an option to password-protect shared content.
- [ ] **File Sharing**
    - [ ] Expand sharing capabilities to support various file types (e.g., images, documents), not just text/code.
- [ ] **Groups & Collaboration (Future)**
    - [ ] Design a system for users to form groups.
    - [ ] Implement member access control for content shared within a group.