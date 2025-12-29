# AUS Social  
A Private Community Model Platform for AUS Students  
CMP 257: Web Application Programming Final Course Project
American University of Sharjah

## Overview
AUS Social is a private, AUS‑only community platform that centralizes announcements, events, Q&A, marketplace posts, and student interactions into a single, responsive web application.
The platform is built using **Jakarta Servlets**, **JDBC**, **MySQL**, **HTML/CSS/JS**, and **Bootstrap 5**, forming a fully functional full‑stack social system.

---

## Core Features

### Unified Social Feed
- Dynamic feed rendered via `FeedServlet`
- Supports multiple post categories:
  - **Announcement**
  - **Event**
  - **Sell**
  - **Question**
  - **Other**
- Like/unlike system with real‑time updates
- Delete permissions for post owners
- “Time‑ago” formatting for readability

### Create Posts
- Category‑aware form with conditional fields:
  - Price (Sell)
  - Event date/time (Event)
  - Location & building (Event)
- Live preview card updates as the user types
- Tag chips with automatic serialization
- Image preview before upload

### Announcements Page
- Filtered view of posts where `category = 'Announcement'`
- Powered by `AnnouncementsServlet`

### Interactive AUS Campus Map
- Clickable building hotspots
- Shows events filtered by building
- “Create here” shortcut pre‑fills building field in the create form

### User Profiles
- View and edit bio
- Profile picture preview before saving
- List of user’s own posts via `MyPostsServlet`

### User Search
- Search by username with live results
- Abortable fetch requests prevent race conditions
- Lightweight profile previews

### Authentication & Sessions
- AUS‑email‑only signup validation
- Secure login with SHA‑256 password hashing
- Session‑based authentication (`currentUser`)
- Protected routes for all post‑related actions

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML, CSS, JavaScript, Bootstrap 5.3.8, Bootstrap Icons |
| **Backend** | Jakarta Servlets, Java, JDBC |
| **Database** | MySQL 8.0 |
| **Security** | SHA‑256 password hashing, session authentication |

---

## Database Schema (Final Implementation)

### **users**
| Field | Type | Notes |
|-------|------|-------|
| id | INT PK | Auto‑increment |
| username | VARCHAR(50) | Required |
| email | VARCHAR(100) | Unique, AUS‑only |
| password_hash | VARCHAR(255) | SHA‑256 |
| bio | TEXT | Nullable |
| created_at | TIMESTAMP | Default now |

### **posts**
| Field | Type | Notes |
|-------|------|-------|
| id | BIGINT PK | Auto‑increment |
| user_id | INT FK → users(id) | Required |
| title | VARCHAR(150) | Required |
| body | TEXT | Required |
| category | VARCHAR(20) | Announcement/Event/Sell/etc |
| price | DECIMAL(10,2) | Nullable |
| event_date | DATE | Nullable |
| event_time | TIME | Nullable |
| location | VARCHAR(100) | Nullable |
| building | VARCHAR(100) | Nullable |
| tags | TEXT | Nullable |
| created_at | TIMESTAMP | Default now |
| like_count | INT | Cached like count |

### **post_likes**
| Field | Type | Notes |
|-------|------|-------|
| user_id | INT FK | PK (user_id, post_id) |
| post_id | BIGINT FK | PK (user_id, post_id) |
| created_at | TIMESTAMP | Default now |

---

## Backend Architecture

### **Authentication Servlets**
- `SignupServlet`: Create new AUS‑verified users  
- `LoginServlet`: Validate credentials & start session  
- `LogoutServlet`: End session  
- `WhoAmIServlet`: Return current user info  

### **Post Servlets**
- `CreatePostServlet`: Insert new posts  
- `FeedServlet`: Return full feed as JSON  
- `AnnouncementsServlet`: Filtered announcements feed  
- `MyPostsServlet`: Posts belonging to logged‑in user  
- `DeletePostServlet`: Delete with ownership check  
- `LikePostServlet`: Toggle likes & update like_count  

### **User Servlets**
- `UserSearchServlet`: Username search  
- `UpdateBioServlet`: Update profile bio  

---

## Frontend Structure

### HTML Pages
- `home.html`: Main feed  
- `create.html`: Post creation  
- `announcements.html`: Announcements feed  
- `map.html`: Interactive campus map  
- `profile.html`: User profile  
- Shared navigation (sidebar + bottom nav)

### JavaScript Modules
- `HomeScript.js`: Feed rendering, pagination, likes  
- `CreateScript.js`: Dynamic form, tag chips, preview  
- `AnnouncementScript.js`: Announcement feed  
- `MapScript.js`: Building hotspots & event filtering  
- `ProfileScript.js`: Bio editing & post management  
- `SearchScript.js`: Live user search  
- `FormScript.js`: Login/signup modal logic  

## References
ChatGPT was used to assist with servlet implementation, FetchAPI usage, and frontend styling. Comments were added where appropriate.
