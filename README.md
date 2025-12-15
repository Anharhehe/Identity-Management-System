# Identity Management System

A modern web application for managing multiple identity profiles with different contexts (professional, personal, family, online). Built with Next.js, React, TypeScript, Node.js, Express, and MongoDB.

## Features

✅ **User Authentication**
- Secure registration with email and password
- Login with JWT token-based authentication
- Password hashing with bcrypt
- Token expiration and refresh handling

✅ **Identity Profile Management**
- Create multiple identity profiles
- Store legal name, preferred name, and nickname
- Categorize identities by context (professional, personal, family, online)
- Edit and delete identity profiles
- View all profiles in an organized dashboard

✅ **Context-Based Identity Retrieval**
- Retrieve identity information based on context type
- Query identities by ID or context
- RESTful API endpoints for all operations

✅ **Security Features**
- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication
- Rate limiting on auth endpoints
- CORS configuration
- Helmet security headers
- Input validation and sanitization

✅ **Modern UI**
- Clean, responsive design with Tailwind CSS
- Dark theme with purple accent colors
- Mobile-friendly interface
- Real-time form validation
- Error and success messages

## Tech Stack

### Frontend
- **Framework**: Next.js 15.4.5 with App Router
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Fetch API
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js (>=16)
- **Framework**: Express.js 4
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: validator.js

### Database
- **MongoDB Atlas** (Cloud)
- Collections: Users, Identities

## Project Structure

```
my-app/
├── client/                          # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── auth/
│   │   │   │   └── page.tsx        # Login/Register page
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # Identity management dashboard
│   │   │   ├── layout.tsx          # Root layout
│   │   │   └── globals.css         # Global styles
│   │   ├── lib/
│   │   │   └── auth.ts             # Auth utility functions
│   │   └── components/             # Reusable components
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── tailwind.config.ts
│
├── server/                          # Express Backend
│   ├── index.js                    # Main server file with all routes
│   ├── utils/
│   │   └── auth.js                 # Auth utilities
│   ├── package.json
│   ├── .env                        # Environment variables
│   └── test-connection.js          # MongoDB connection test
│
├── API_DOCUMENTATION.md            # Complete API documentation
└── README.md                        # This file
```

## Installation & Setup

### Prerequisites
- Node.js >= 16
- npm or yarn
- MongoDB Atlas account
- Git

### Step 1: Clone the Repository
```bash
cd "d:/Mujiz FYP/IMS"
```

### Step 2: Setup Backend

```bash
cd my-app/server

# Install dependencies
npm install

# Create .env file with your MongoDB credentials
# MONGODB_URI=mongodb+srv://Canada_Mattress:%40hehesiuuu12@cluster0.ndwle.mongodb.net/identity-management-system?retryWrites=true&w=majority
# JWT_SECRET=your-secret-key
# PORT=5000
# CLIENT_URL=http://localhost:3000

# Test MongoDB connection
npm run test-connection

# Start the server
npm run dev
```

The server will run on `http://localhost:5000`

### Step 3: Setup Frontend

```bash
cd ../client

# Install dependencies
npm install

# Create .env.local file
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

### 1. Register a New Account
1. Navigate to `http://localhost:3000`
2. Click "Get Started" or "Sign In"
3. Click "Sign up" to create a new account
4. Enter email and password (must be 8+ chars with uppercase, lowercase, number, special char)
5. Click "Create Account"

### 2. Login
1. Go to the auth page
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

### 3. Create Identity Profile
1. On the dashboard, click "+ Create New Identity"
2. Fill in the form:
   - **Legal Name**: Your full legal name
   - **Preferred Name**: How you prefer to be called
   - **Nickname**: Optional nickname
   - **Context**: Select from professional, personal, family, or online
3. Click "Create Profile"

### 4. Manage Identities
- **View**: All your identities are displayed as cards on the dashboard
- **Edit**: Click the "Edit" button on any identity card to modify it
- **Delete**: Click the "Delete" button to remove an identity (confirmation required)

### 5. Logout
- Click the "Logout" button in the top right corner

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)

### Identity Management
- `POST /api/identities` - Create identity (requires auth)
- `GET /api/identities` - Get all identities (requires auth)
- `GET /api/identities/:id` - Get identity by ID (requires auth)
- `GET /api/identities/context/:context` - Get identity by context (requires auth)
- `PUT /api/identities/:id` - Update identity (requires auth)
- `DELETE /api/identities/:id` - Delete identity (requires auth)

### Health
- `GET /api/health` - Health check

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Environment Variables

### Server (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/identity-management-system
JWT_SECRET=your-super-secret-jwt-key-should-be-very-long-and-random
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
BCRYPT_ROUNDS=12
```

### Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Security Considerations

1. **Password Security**
   - Passwords are hashed with bcrypt (12 rounds)
   - Minimum 8 characters with complexity requirements
   - Never stored in plain text

2. **Authentication**
   - JWT tokens expire after 7 days
   - Tokens are stored in localStorage (consider using httpOnly cookies for production)
   - Authorization header required for protected endpoints

3. **Rate Limiting**
   - General endpoints: 100 requests per 15 minutes per IP
   - Auth endpoints: 5 requests per 15 minutes per IP

4. **Input Validation**
   - All inputs are validated on both client and server
   - Email validation with validator.js
   - Password strength validation
   - Identity field length limits

5. **CORS**
   - Configured to accept requests only from `http://localhost:3000`
   - Update in production with your domain

6. **HTTPS**
   - Use HTTPS in production
   - Set secure cookies if using httpOnly cookies

## Development

### Running Tests
```bash
# Server tests
cd server
npm run test

# Watch mode
npm run test:watch
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
npm start
```

**Backend:**
```bash
cd server
npm start
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Test connection
cd server
npm run test-connection
```

Check:
- MongoDB URI is correct
- Username and password are correct
- IP address is whitelisted in MongoDB Atlas
- Network connection is stable

### CORS Errors
- Ensure `CLIENT_URL` in server .env matches your frontend URL
- Check that frontend is making requests to correct API URL

### Token Expiration
- Tokens expire after 7 days
- User needs to login again
- Consider implementing token refresh in production

### Port Already in Use
```bash
# Change PORT in .env or kill the process using the port
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Performance Optimization

1. **Database Indexing**
   - Email field is indexed (unique)
   - userId field is indexed in Identity collection

2. **API Response Optimization**
   - Passwords excluded from user responses
   - Only necessary fields returned

3. **Frontend Optimization**
   - Next.js automatic code splitting
   - Tailwind CSS purging unused styles
   - Image optimization with Next.js Image component

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] Identity sharing/permissions
- [ ] Audit logs
- [ ] Profile picture support
- [ ] Export identities as PDF
- [ ] Mobile app
- [ ] Dark/Light theme toggle

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open an issue in the repository.

## Author

Built with ❤️ for the Identity Management System project.

---

**Last Updated**: January 2025
**Version**: 1.0.0
