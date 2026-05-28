# Security Implementation Guide

## 🔒 Security Features Implemented

Your website now has enterprise-level security features:

### 1. **Authentication System**
- ✅ User registration and login
- ✅ JWT (JSON Web Token) based authentication
- ✅ Secure password hashing with bcryptjs
- ✅ 24-hour token expiration
- ✅ Automatic logout on token expiration

### 2. **Protected Routes**
- ✅ All API endpoints require authentication
- ✅ Automatic redirect to login page for unauthenticated users
- ✅ Token validation on every request
- ✅ Session management with localStorage

### 3. **Security Headers**
- ✅ X-Content-Type-Options: nosniff (prevents MIME type sniffing)
- ✅ X-Frame-Options: DENY (prevents clickjacking)
- ✅ X-XSS-Protection: enabled (prevents XSS attacks)
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy: disabled camera, microphone, geolocation

### 4. **Password Security**
- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ Minimum 6 character requirement
- ✅ Password confirmation on registration
- ✅ Never stored in plain text

### 5. **API Security**
- ✅ Bearer token validation
- ✅ Request headers include authorization
- ✅ Automatic logout on 401/403 responses
- ✅ CORS-friendly implementation

---

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. Generate a strong JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Add the generated secret to `JWT_SECRET` in `.env`

### Step 3: Start the Server
```bash
npm start
```

### Step 4: Access Your Application
1. Open browser to `http://localhost:3000`
2. You'll be redirected to login page
3. Create a new account or use demo credentials:
   - **Username:** admin
   - **Password:** password123

---

## 📝 Default Demo User

For testing purposes, a demo user is created on startup:
- **Username:** admin
- **Password:** password123

⚠️ **IMPORTANT:** Change or remove this demo user before deploying to production!

To remove demo user, comment out or delete these lines in `server.js`:
```javascript
users.set('admin', {
  email: 'admin@example.com',
  passwordHash: await bcryptjs.hash('password123', 10)
});
```

---

## 🔐 Files Modified/Created

### New Files:
- `login.html` - Login and registration page
- `.env.example` - Environment configuration template

### Modified Files:
- `package.json` - Added bcryptjs and jsonwebtoken dependencies
- `server.js` - Added authentication middleware and protected endpoints
- `index.html` - Added auth checks and logout functionality

---

## 📱 Login Page Features

### Registration
- New user sign-up
- Email validation
- Password confirmation
- Duplicate username prevention

### Login
- Username/password authentication
- Remember me functionality (via localStorage)
- Automatic redirect to dashboard
- Error handling and user feedback

---

## 🔄 How Authentication Works

1. **User Registration/Login**
   - Credentials sent securely to `/api/auth/register` or `/api/auth/login`
   - Password is hashed using bcryptjs
   - JWT token generated on successful authentication

2. **Token Storage**
   - Token stored in browser's localStorage
   - Username also stored for greeting display

3. **Protected Requests**
   - Every API request includes `Authorization: Bearer {token}` header
   - Server validates token before processing requests
   - Invalid/expired tokens trigger automatic logout

4. **Automatic Logout**
   - User logout clears localStorage
   - Session expires after 24 hours
   - Unauthorized requests redirect to login page

---

## 🛡️ Production Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Remove demo user (admin/password123)
- [ ] Set up HTTPS/SSL certificate
- [ ] Store sensitive data in environment variables
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Use proper user management (migrate from in-memory users)
- [ ] Set up rate limiting on login endpoint
- [ ] Enable CORS only for trusted domains
- [ ] Use strong passwords for admin accounts
- [ ] Set up monitoring and logging
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Protected (Require Authorization Header)
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `DELETE /api/orders?id={id}` - Delete order
- `POST /api/notify` - Send notifications

---

## 🚨 Troubleshooting

### "Unauthorized: No token provided"
- Make sure you're logged in
- Check if token exists in browser localStorage
- Clear cache and login again

### "Invalid or expired token"
- Token expired after 24 hours
- Login again to get new token

### Login page keeps reloading
- Clear browser cache and localStorage
- Check if token was corrupted
- Try in incognito/private mode

---

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Review server logs
3. Verify environment variables are set correctly
4. Ensure all dependencies are installed

---

## 📚 Additional Resources

- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Introduction](https://jwt.io/introduction)
- [Bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)
- [OWASP Security Guide](https://owasp.org/)

---

**Last Updated:** May 2026
**Version:** 1.1.0 (Security Enhanced)
