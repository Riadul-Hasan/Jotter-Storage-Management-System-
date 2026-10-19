# 📦 Jotter - Storage Management System

A full-stack **Storage Management System** built with **Node.js**, **Express.js**, **MongoDB**, and **React** following the **Modular Design Pattern**. This application allows users to manage their files, notes, images, and PDFs with features like folders, favorites, calendar view, and private locked storage.

---

## 🎯 **Project Overview**

Jotter is a comprehensive **Storage Management System** designed to help users securely store, organize, and manage their digital files in one centralized place. Built with a modular architecture, Jotter provides a seamless experience for handling notes, images, PDFs, and folders with advanced features like favorites, calendar tracking, and password-protected private storage.

### **What Jotter Does**

Jotter enables users to:

- **Upload & Organize Files** — Store notes, images, and PDFs with drag-and-drop support and intuitive categorization
- **Create Folders** — Build a nested folder structure to keep your files neatly organized
- **Favorite Items** — Mark important files as favorites for quick access from the Favorites page
- **Calendar View** — Track and view your files by date using an interactive calendar interface
- **Private Locked Folder** — Secure sensitive items with password protection in a dedicated private folder
- **Search & Filter** — Quickly find files using search functionality and filter by type or favorite status
- **User Authentication** — Secure signup/login with session-based authentication and bcrypt password hashing

### **Who It's For**

Jotter is ideal for students, professionals, freelancers, and anyone who needs a reliable system to manage their digital documents, notes, and media files without relying on cloud storage subscriptions.

### **Key Highlights**

| Feature | Description |
|---------|-------------|
| 📁 **File Management** | Upload, view, and organize notes, images, and PDFs |
| 📂 **Nested Folders** | Create and manage folders with parent-child relationships |
| ⭐ **Favorites** | Star important items for instant access |
| 📅 **Calendar View** | Visualize files by creation/update date |
| 🔒 **Locked Folder** | Password-protected storage for private files |
| 🔍 **Search & Filter** | Find files quickly with search and type/favorite filters |
| 🔐 **Authentication** | Secure user login with session management |
| 📱 **Responsive UI** | Mobile-first design with Tailwind CSS |

---

## 🛠️ **Tech Stack**

### **Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- Express-Session (for authentication)
- Bcrypt (for password hashing)
- Multer (for file uploads)
- Nodemailer (for email verification)

### **Frontend:**
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- React Toastify
- React Icons
- Vite

---

## 📁 **Project Structure**

```
jotter-project/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── itemController.js     # Item CRUD operations
│   │   └── profileController.js  # User profile management
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Item.js               # Item schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── itemRoutes.js         # Item endpoints
│   │   └── profileRoutes.js      # Profile endpoints
│   ├── uploads/                  # Uploaded files storage
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Axios configuration
    │   ├── components/
    │   │   ├── Header.jsx        # Header with search & lock
    │   │   ├── BottomNav.jsx     # Bottom navigation
    │   │   ├── ItemCard.jsx      # Reusable item card
    │   │   └── ProtectedRoute.jsx # Route protection
    │   ├── pages/
    │   │   ├── Landing.jsx       # Landing page
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Signup.jsx        # Registration page
    │   │   ├── Home.jsx          # Dashboard
    │   │   ├── Folders.jsx       # All folders
    │   │   ├── AllNotes.jsx      # All notes
    │   │   ├── AllImages.jsx     # All images
    │   │   ├── AllPdfs.jsx       # All PDFs
    │   │   ├── Favorites.jsx     # Favorite items
    │   │   ├── Calendar.jsx      # Calendar view
    │   │   ├── LockedFolder.jsx  # Private folder
    │   │   ├── Profile.jsx       # User profile
    │   │   └── Settings.jsx      # Settings page
    │   ├── App.jsx               # Main app component
    │   └── main.jsx              # React entry point
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 **Installation & Setup**

### **Prerequisites:**
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### **Backend Setup:**
```bash
cd backend
npm install
# Configure .env file with your MongoDB URI and session secret
npm start
```

### **Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

---

## 📱 **Features**

### **1. File Management**
Upload and organize notes, images, and PDFs with ease.

### **2. Folder Organization**
Create nested folders to structure your files hierarchically.

### **3. Favorites**
Star important items for quick access from the dedicated Favorites page.

### **4. Calendar View**
View your files organized by date in an interactive calendar.

### **5. Private Locked Folder**
Store sensitive files in a password-protected private folder.

### **6. Search & Filter**
Search for files and filter by type (note, image, pdf, folder) or favorite status.

### **7. User Authentication**
Secure signup and login with session-based authentication.

### **8. Responsive Design**
Mobile-first approach with Tailwind CSS and bottom navigation for mobile.

---

## 🧪 **Testing with Postman**

Import the provided `Jotter_Postman_Collection.json` file into Postman to test all API endpoints.

**Steps:**
1. Open Postman
2. Click "Import" button
3. Select the JSON file
4. All endpoints will be available in the collection

---

## 🔒 **Security Features**

- Password hashing with bcrypt (10 salt rounds)
- Session-based authentication
- Protected API routes with middleware
- File upload validation
- XSS protection
- CORS configuration

---

## 📊 **Database Schema**

### **User Schema**
```javascript
{
  username: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  hasLockPassword: Boolean,
  lockPassword: String,
  resetCode: String,
  resetCodeExpires: Date,
  createdAt: Date
}
```

### **Item Schema**
```javascript
{
  userId: ObjectId (ref: User),
  type: String (note|image|pdf|folder),
  name: String,
  content: String,
  filePath: String,
  fileSize: Number,
  parentFolder: ObjectId (ref: Item),
  isFavorite: Boolean,
  password: String,
  shareLink: String,
  isLocked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 **Design Reference**

- **Figma Design:** [View Design](https://www.figma.com/design/d8CWS1DKFiwcFBCokLzVmC/Storage-Management-System)
- **Video Explanation:** [Watch Video](https://drive.google.com/file/d/1MGdgpg0wkxyMnWPmvLsLiNhTiZppkzLK/view)

---

## 📝 **Best Practices Followed**

1. **Modular Architecture** - Separation of concerns (Routes, Controllers, Models)
2. **Clean Code** - Consistent naming conventions and formatting
3. **Error Handling** - Try-catch blocks and proper error messages
4. **Security** - Password hashing, session management, input validation
5. **RESTful API Design** - Proper HTTP methods and status codes
6. **Code Reusability** - Reusable components and middleware
7. **Documentation** - Comments and clear function names

---

## 🐛 **Known Issues & Future Enhancements**

### **Future Enhancements:**
- [ ] File sharing with other users
- [ ] Trash/Recycle bin for deleted items
- [ ] Advanced search with filters
- [ ] File versioning
- [ ] Storage upgrade plans
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Folder color coding
- [ ] Bulk operations

---

## 👨‍💻 **Developer**

**Your Name**  
Email: your.email@example.com  
GitHub: [@yourusername](https://github.com/yourusername)

---

## 📄 **License**

This project is developed as part of a technical assessment for SparkTech Agency.

---

## 🙏 **Acknowledgments**

- SparkTech Agency for the opportunity
- Figma design provided by SparkTech Agency
- MongoDB Atlas for database hosting
- All open-source libraries used in this project

---

## 📞 **Support**

For any questions or issues, please contact:
- Email: your.email@example.com
- Create an issue in the GitHub repository

---

**Last Updated:** October 17, 2026

---

**Note:** This is a technical assessment project for SparkTech Agency's Backend Developer position.