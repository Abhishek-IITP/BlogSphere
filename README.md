# 📚 BlogSphere - MERN Blogging Platform

BlogSphere is a full-featured, modern blogging platform built with the **MERN stack** and integrated with **Firebase** for authentication. It offers a seamless user experience inspired by platforms like Medium, including rich blog editing with Editor.js, nested comments, image uploads, and more.

## 🎥 Project Demo Video

[![Watch Demo](https://drive.google.com/file/d/1f9kaADR5I_2y3BFNrQeuL1_XhGhAvTu8/view?usp=sharing)](https://drive.google.com/file/d/1N02jlLaoljnLxigEttE7kJdYIBePBaHe/view?usp=sharing)

*Click the image above to watch the demo video.*




## 🌐 Live Demo

[🔗 Visit BlogSphere](https://blog-sphere-zx96.vercel.app/)

## 📁 GitHub Repository

[🔗 View on GitHub](https://github.com/Abhishek-IITP/BlogSphere)

---

## 🧰 Tech Stack

### Frontend

* React 19
* Redux Toolkit
* React Router v7
* Tailwind CSS 4
* Framer Motion
* Firebase (Auth)
* Editor.js (Rich text editor)
* Lucide Icons
* Vite

### Backend

* Node.js
* Express.js (MVC structure)
* MongoDB with Mongoose
* Firebase Admin SDK
* JWT for protected routes
* Cloudinary for image uploads
* Nodemailer (fallback email verification)

---

## 🚀 Features

* ✍️ Rich text blog editing with Editor.js
* 🔐 Firebase Auth + JWT
* 📧 Email verification (Firebase/Nodemailer fallback)
* 🧵 Nested Comments
* ❤️ Like / Save blogs with visibility toggles
* 🧑‍💼 User profile with settings
* 🖼 Image Upload (Cloudinary)
* 📱 Fully responsive

---

## ⚙️ Setup Instructions

### ✅ Prerequisites

* Node.js (v16+)
* MongoDB Atlas account
* Firebase project
* Cloudinary account

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/Abhishek-IITP/BlogSphere.git
cd BlogSphere
```

### 2. Install dependencies

#### Frontend

```bash
cd Frontend
npm install
```

#### Backend

```bash
cd Backend
npm install
```

---

## 🔑 Environment Variables

### Backend: `/server/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_sdk_client_email
FIREBASE_PRIVATE_KEY=your_firebase_admin_private_key (escaped with \\n)
```

### Frontend: `/client/.env`

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 🔥 Firebase Setup Guide

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication > Sign-in method > Email/Password** and **Google Sign-In**.
3. Go to **Project Settings > General > Web App** to get your credentials (API Key, App ID, etc.).
4. Create a **service account**:

   * Go to **Project Settings > Service accounts**
   * Click "Generate new private key"
   * Download the JSON and extract:

     * `client_email`
     * `private_key`
     * `project_id`
   * Add them in `/`Backend/.env

---

## ▶️ Running the App

### Backend

```bash
cd Backend
npm run dev
```

### Frontend

```bash
cd Frontend
npm run dev
```

The app will be available at: [http://localhost:5173](http://localhost:5173)

---

## 🤝 Contribution

Pull requests are welcome! Open issues, report bugs, or request features.

## 🪪 License

MIT License

## 👨‍💻 Author

Built with ❤️ by [Abhishek](https://github.com/Abhishek-IITP)

---
