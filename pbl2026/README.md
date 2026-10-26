# BreedVision AI — Frontend

**"Image-Based Breed Recognition for Cattle & Buffaloes of India"**

A simple, clean, modern, and professional web frontend for AI-assisted indigenous livestock breed classification, field verification, and dataset curation.

---

## 👥 Supported Roles & Access Control

1. **User (Livestock Owner / Farmer)**
   - Overview Home with summary counters (`/user/home`)
   - Dedicated Image Upload & AI analysis pipeline (`/user/upload`)
   - Analysis Result with confidence and top-3 candidates (`/user/result/:id`)
   - Grad-CAM visual heatmaps & overlays (`/user/gradcam/:id`)
   - Previous analyses history with detailed inspection and deletion (`/user/history`)
   - Profile management (`/user/profile`)

2. **Field-Level Worker (FLW)**
   - Review overview dashboard (`/flw/home`)
   - Queue of user uploads awaiting field validation (`/flw/pending`)
   - Interactive review with Grad-CAM and one-click verification or breed correction (`/flw/review/:id`)
   - Verification log & history with filters (`/flw/verified`, `/flw/history`)
   - Correction notes and feedback log (`/flw/feedback`)
   - Worker profile management (`/flw/profile`)

3. **Administrator (Admin)**
   - System overview with metrics (`/admin/home`)
   - User account activation, deactivation & removal (`/admin/users`)
   - Ground-truth dataset image management & label editing (`/admin/dataset`)
   - Model testing sandbox with real evaluation metrics (`/admin/model-testing`)
   - FLW feedback inspection (`/admin/feedback`)
   - System reports (`/admin/reports`)
   - Profile management (`/admin/profile`)

---

## 🛠️ Tech Stack & Architecture

- **React 18** with **Vite**
- **Tailwind CSS** (Clean, uncluttered, consistent visual system)
- **React Router v6** with Strict Role-Based Access Control (RBAC)
- **FastAPI-Ready API Service** (`src/services/api.js`) with persistent storage and realistic mock data

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick Demo Accounts:
- **User**: `ramesh@example.com` / `password123`
- **FLW**: `flw@example.com` / `password123`
- **Admin**: `admin@breedvision.ai` / `password123`
