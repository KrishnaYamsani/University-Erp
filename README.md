# 🎓 University ERP System

A robust and modular **University ERP (Enterprise Resource Planning) System** built with **Node.js, Express.js, EJS, and PostgreSQL**, designed to streamline academic administration for institutions with multiple user roles and workflows.

---

## 🚀 Features

### 🧑‍🎓 Student Module
- View personal **profile**, **grades**, and **registered courses**
- Track **attendance** and view **exam schedules**
- Submit **payments** and check transaction history
- Participate in **course pre-registration** and view allocation results

### 🧑‍🏫 Faculty Module
- Create and manage **course offerings**
- Define **grading and attendance policies**
- Schedule **exams** and publish **grades**
- Track student **enrollments** and attendance records

### 🧑‍💼 Faculty Advisor Module
- Verify **student payment records** for registration
- Manage assigned **student batches** and details
- Execute **GPA-based pre-registration allotment** script
- Serve as a central administrative controller for academic operations

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** EJS, Bootstrap 5
- **Database:** PostgreSQL
- **Authentication:** JWT with secure cookie-based sessions
- **Password Security:** Bcrypt hashing

---

## 🔐 Authentication & Roles

- Secure login via **JWT-based auth**
- Passwords are **encrypted using Bcrypt**
- Middleware-driven **role-based access control** for:
  - Students
  - Faculty
  - Faculty Advisors (Admin privileges)

---


## ✅ How to Run

1. **Install dependencies**
   ```bash
   npm install
2. **Start Application** 
    ```bash
   node index.js
