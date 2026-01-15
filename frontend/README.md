# 📦 Jotter - Storage Management System

A full-stack **Storage Management System** built with **Node.js**, **Express.js**, **MongoDB**, and **React** following the **Modular Design Pattern**. This application allows users to manage their files, notes, images, and PDFs with features like folders, favorites, calendar view, and private locked storage.

---

## 🎯 **Project Overview**

Jotter is a comprehensive storage management application that enables users to:
- **Upload & Organize** files (Notes, Images, PDFs)
- **Create Folders** with nested structure
- **Favorite Items** for quick access
- **Calendar View** to track items by date
- **Private Folder** with password protection
- **Search & Filter** capabilities
- **User Authentication** with session management

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

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/jotter-storage-system.git
cd jotter-storage-system
```

### **2. Backend Setup**

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file with the following:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# SESSION_SECRET=your_secret_key
# CLIENT_URL=http://localhost:5173

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### **3. Frontend Setup**

Open a new terminal:

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

---

## 🔑 **Environment Variables**

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jotter
SESSION_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:5173

# Email Configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 📡 **API Endpoints**

### **Authentication Routes** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| GET | `/me` | Get current user |
| POST | `/forgot-password` | Send password reset code |
| POST | `/verify-code` | Verify reset code |
| POST | `/reset-password` | Reset password |

### **Item Routes** (`/api/items`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all items (with filters) |
| GET | `/stats` | Get storage statistics |
| GET | `/recent` | Get recent items |
| GET | `/locked` | Get locked folder items |
| POST | `/` | Create new item |
| GET | `/:id` | Get item by ID |
| PUT | `/:id` | Update item |
| DELETE | `/:id` | Delete item |
| PATCH | `/:id/favorite` | Toggle favorite |
| POST | `/:id/duplicate` | Duplicate item |
| POST | `/:id/share` | Generate share link |

### **Folder Routes** (`/api/folders`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/:id/lock` | Lock folder with password |
| POST | `/:id/unlock` | Unlock folder |
| POST | `/:id/remove-lock` | Remove folder lock |

### **Profile Routes** (`/api/profile`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get user profile |
| PUT | `/` | Update profile |
| POST | `/set-lock-password` | Set private folder password |
| POST | `/verify-lock-password` | Verify private folder password |

---

## ✨ **Key Features**

### **1. User Authentication**
- Secure signup/login with bcrypt password hashing
- Session-based authentication
- Password reset with email verification
- Protected routes

### **2. File Management**
- Upload images, PDFs, and create notes
- Organize files in folders
- View files in modal with download option
- Delete, rename, duplicate files
- Copy to clipboard functionality

### **3. Storage Statistics**
- Real-time storage usage tracking
- Category-wise breakdown (Folders, Notes, Images, PDFs)
- Visual storage progress bar

### **4. Favorites**
- Mark items as favorites
- Quick access to favorite items
- View favorites in dedicated page

### **5. Calendar View**
- View items by date
- Month navigation
- Date-specific item filtering

### **6. Private Folder**
- Password-protected storage
- Separate locked items
- Full CRUD operations in private folder

### **7. Search & Filter**
- Search items by name
- Filter by type (note, image, pdf, folder)
- Filter by favorite status

### **8. Responsive Design**
- Mobile-first approach
- Tailwind CSS styling
- Bottom navigation for mobile
- Modal-based file viewing

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

**Last Updated:** January 16, 2025

---

**Note:** This is a technical assessment project for SparkTech Agency's Backend Developer position.