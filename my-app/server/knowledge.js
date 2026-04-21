// Identity Management System - Chatbot Knowledge Base
// This file contains all system information for the AI chatbot to provide intelligent responses

const knowledge = {
  // ============ PROJECT OVERVIEW ============
  projectOverview: {
    name: "Identity Management System (IMS)",
    tagline: "Unify Your Digital Self",
    description: "A context-aware identity management platform that enables users to create and manage multiple identity profiles across different aspects of their lives (professional, personal, family, online) with secure, encrypted communication.",
    version: "1.0.0",
    launchDate: "2024",
    developers: ["Anhar Munir", "Abdullah Tariq"],
    institution: "FAST NUCES, Islamabad"
  },

  // ============ CORE FEATURES ============
  features: {
    multipleIdentities: {
      title: "Multiple Identity Profiles",
      description: "Create up to 4 distinct identity profiles for different life contexts",
      contexts: ["professional", "personal", "family", "online"],
      benefits: [
        "Separate professional and personal information",
        "Control what different audiences see",
        "Maintain privacy across contexts",
        "Manage cultural naming preferences"
      ]
    },
    secureAuthentication: {
      title: "Secure Authentication",
      description: "Enterprise-grade security for user accounts",
      features: [
        "JWT token-based authentication",
        "bcrypt password hashing",
        "Rate limiting (5 attempts per 15 minutes)",
        "Email validation",
        "Session management"
      ]
    },
    friendManagement: {
      title: "Friend Management System",
      description: "Build and manage social connections within specific contexts",
      features: [
        "Send friend requests",
        "Accept/decline requests",
        "Follow public accounts",
        "Context-specific friend lists",
        "Bidirectional friendships"
      ]
    },
    messaging: {
      title: "Encrypted Messaging",
      description: "Secure, context-aware messaging with AES-256 encryption",
      features: [
        "End-to-end encrypted messages",
        "Message preview display",
        "Unread message badges",
        "Conversation history",
        "Context-specific threads",
        "Real-time notifications"
      ]
    },
    searchDiscovery: {
      title: "Smart Search & Discovery",
      description: "Find other users and their public profiles",
      features: [
        "Search by name or bio",
        "Filter by context/type",
        "Case-insensitive search",
        "Public/private profile visibility",
        "Quick friend request access"
      ]
    },
    notifications: {
      title: "Notifications Dashboard",
      description: "Real-time alerts for all account activities",
      features: [
        "Friend request notifications",
        "Follow notifications",
        "Message notifications",
        "Mark as read/delete",
        "Context-specific alerts"
      ]
    },
    adminPanel: {
      title: "Admin Dashboard",
      description: "Complete platform management for administrators",
      features: [
        "User management",
        "View all users and their identities",
        "Send platform notifications",
        "Delete identities",
        "Monitor system activity"
      ]
    },
    accountSettings: {
      title: "Account Management",
      description: "Manage profile, security, and account preferences",
      features: [
        "Edit profile information",
        "Change password",
        "Update email",
        "Delete account permanently",
        "Privacy preferences"
      ]
    }
  },

  // ============ IDENTITY TYPES ============
  identityTypes: {
    professional: {
      name: "Professional",
      icon: "Briefcase",
      color: "violet",
      description: "For work, career, and business interactions",
      useCases: [
        "Workplace communications",
        "Professional networking",
        "Business credentials",
        "Career development",
        "Work-related projects"
      ],
      fields: ["Legal Name", "Preferred Name", "Nickname", "Bio"],
      privacy: ["Public", "Private"],
      icon_example: "👔"
    },
    personal: {
      name: "Personal",
      icon: "User",
      color: "sky",
      description: "For close friends and personal connections",
      useCases: [
        "Close friends",
        "Personal updates",
        "Hobby discussions",
        "Social activities",
        "Personal interests"
      ],
      fields: ["Legal Name", "Preferred Name", "Nickname", "Bio"],
      privacy: ["Public", "Private"],
      icon_example: "👤"
    },
    family: {
      name: "Family",
      icon: "Users",
      color: "rose",
      description: "For family members and relatives",
      useCases: [
        "Family communications",
        "Relative connections",
        "Family events",
        "Cultural name preferences",
        "Family-specific information"
      ],
      fields: ["Legal Name", "Preferred Name", "Nickname", "Bio"],
      privacy: ["Public", "Private"],
      icon_example: "👨‍👩‍👧‍👦"
    },
    online: {
      name: "Online",
      icon: "Globe",
      color: "emerald",
      description: "For online communities and digital presence",
      useCases: [
        "Social media presence",
        "Gaming communities",
        "Online forums",
        "Digital personas",
        "Username identities"
      ],
      fields: ["Legal Name", "Preferred Name", "Nickname", "Bio"],
      privacy: ["Public", "Private"],
      icon_example: "🌐"
    }
  },

  // ============ HOW-TO GUIDES ============
  howToGuides: {
    gettingStarted: {
      title: "Getting Started with IMS",
      steps: [
        {
          step: 1,
          title: "Sign Up",
          description: "Create an account with your email and password. Verify your email to activate your account.",
          details: "Use a strong password with uppercase, lowercase, and numbers for security."
        },
        {
          step: 2,
          title: "Create Your First Identity",
          description: "Navigate to Dashboard and click 'Create New Identity'. Choose a context (Professional, Personal, Family, or Online).",
          details: "Enter your legal name and preferred name. Nickname is optional but helpful for quick identification."
        },
        {
          step: 3,
          title: "Set Privacy Level",
          description: "Choose whether your identity is Public (discoverable by anyone) or Private (only visible to friends).",
          details: "Public profiles can be followed by anyone. Private profiles require friend requests first."
        },
        {
          step: 4,
          title: "Start Connecting",
          description: "Use the Search feature to find other users in your chosen context. Send friend requests or follow public profiles.",
          details: "Each context maintains separate friend lists. Professional friends won't see your personal profile."
        }
      ]
    },
    createIdentity: {
      title: "How to Create an Identity Profile",
      steps: [
        "Go to Dashboard → Click 'Create New Identity'",
        "Enter your Legal Name (required, appears in records)",
        "Enter your Preferred Name (how you want to be called)",
        "Enter Nickname (optional, for casual identification)",
        "Select Context: Professional / Personal / Family / Online",
        "Choose Privacy: Public (visible to all) or Private (friends only)",
        "Click 'Create Profile' button",
        "Profile appears in your dashboard and is ready to use"
      ]
    },
    sendFriendRequest: {
      title: "How to Send a Friend Request",
      steps: [
        "Click the Search icon in the header",
        "Select the context you want to search in",
        "Type the name or bio of the person you're looking for",
        "Browse the search results",
        "Click on a profile to view full details",
        "Click 'Send Friend Request' button",
        "Wait for recipient to accept your request",
        "Once accepted, you'll see them in your Friends list"
      ]
    },
    sendMessage: {
      title: "How to Send a Message",
      prerequisites: [
        "Must have created an identity in the desired context",
        "Must be friends with the recipient in that context"
      ],
      steps: [
        "Go to Dashboard",
        "Click the Messages icon or navigate to Messages",
        "Select the context you want to message in",
        "Choose a friend from your friends list",
        "Type your message in the input field",
        "Press Enter or click Send",
        "Message is encrypted and sent securely",
        "Recipient receives a notification"
      ]
    },
    manageNotifications: {
      title: "How to Manage Notifications",
      steps: [
        "Click the Bell icon in the header",
        "View all your notifications",
        "Read notification details (sender, message, context)",
        "Click 'Mark as Done' to mark a notification as read",
        "Click 'Delete' to remove a notification",
        "Notifications show friend requests, follows, and messages",
        "Different colors indicate different contexts"
      ]
    },
    updateProfile: {
      title: "How to Update Your Account Profile",
      steps: [
        "Click the Settings icon in the header",
        "Go to Profile Section",
        "Click 'Edit Profile' to expand",
        "Update First Name or Last Name",
        "Update Email (must be unique)",
        "Click 'Save Changes'",
        "Wait for success confirmation"
      ]
    },
    changePassword: {
      title: "How to Change Your Password",
      steps: [
        "Click the Settings icon in the header",
        "Scroll to Password Section",
        "Click 'Change Password' to expand",
        "Enter Current Password",
        "Enter New Password (minimum 8 characters)",
        "Confirm New Password",
        "Click 'Save Changes'",
        "Password is updated successfully"
      ]
    },
    deleteAccount: {
      title: "How to Delete Your Account",
      warning: "This action is permanent and cannot be undone. All your identities and messages will be deleted.",
      steps: [
        "Click the Settings icon in the header",
        "Scroll to Delete Account Section",
        "Read the warning carefully",
        "Enter your email for verification",
        "Click 'Delete Account' button",
        "Confirm the deletion",
        "Account and all data is permanently removed"
      ]
    }
  },

  // ============ FAQ ============
  faq: [
    {
      question: "What is an Identity Profile?",
      answer: "An Identity Profile is a distinct persona you create within IMS representing how you present yourself in a specific context. For example, your Professional identity might use formal names, while your Personal identity uses nicknames. Each identity can have different privacy settings and maintain separate friend lists."
    },
    {
      question: "Can I create multiple identities in the same context?",
      answer: "No, you can only create one identity per context. The four available contexts are Professional, Personal, Family, and Online. This ensures clear organization and prevents context bleed."
    },
    {
      question: "What's the difference between Public and Private profiles?",
      answer: "Public profiles are visible to everyone and can be followed by any user. Private profiles are hidden by default and only visible to users you've accepted as friends. This gives you full control over who can see your information."
    },
    {
      question: "Can my Professional friends see my Personal profile?",
      answer: "No! This is the core feature of IMS. Your Professional friends only see your Professional identity. Your Personal friends only see your Personal identity. Contexts are completely separated and private."
    },
    {
      question: "How are my messages protected?",
      answer: "All messages are encrypted using AES-256 encryption before being stored in the database. This means only you and the recipient can read your messages. Even system administrators cannot access the decrypted content. Your privacy is guaranteed."
    },
    {
      question: "Are my passwords secure?",
      answer: "Yes. Passwords are hashed using bcrypt before storage, which is a one-way encryption. Raw passwords are never stored in the database. Even if the database were compromised, attackers would get useless hash values instead of actual passwords."
    },
    {
      question: "How long does it take to send a message?",
      answer: "Messages are sent instantly. The recipient receives a notification in real-time. However, they won't see the message until they open the chat or click on the notification. All messages are encrypted during transit and storage."
    },
    {
      question: "Can I block someone from messaging me?",
      answer: "Currently, IMS doesn't have a blocking feature in the basic version. However, you can remove someone as a friend, and they won't be able to message you anymore. Future versions will include blocking functionality."
    },
    {
      question: "What happens when I delete an identity?",
      answer: "When you delete an identity, all associated data is removed including: the identity profile, friend connections in that context, and conversation history. This action is permanent and cannot be undone."
    },
    {
      question: "Can I recover a deleted identity?",
      answer: "No, deleted identities cannot be recovered. However, you can create a new identity with the same information. We recommend being certain before deleting any identity."
    },
    {
      question: "How do notifications work?",
      answer: "Notifications alert you to important events: friend requests, when someone follows you, and new messages. Notifications appear in your notification dashboard (bell icon). You can mark them as read or delete them. Each notification shows the sender and context."
    },
    {
      question: "How do I find people to connect with?",
      answer: "Use the Search feature (magnifying glass icon) to search for identities by name or bio. Filter by context to find people in specific areas of your life. Public profiles appear in search results. For private profiles, you need to know their name to find them."
    },
    {
      question: "What if I forget my password?",
      answer: "Currently, IMS doesn't have a password recovery feature. You'll need to contact support. Future versions will include 'Forgot Password' with email recovery options. Make sure to use a password manager to keep track of your credentials."
    },
    {
      question: "Is my data sold to third parties?",
      answer: "No. IMS is designed with privacy-first principles. Your data is never sold. It's only used to provide the service and improve your experience. We comply with GDPR and prioritize your data protection."
    },
    {
      question: "Can I export my data?",
      answer: "This feature is not available in the current version, but it's planned for future releases. You'll be able to download your identity information, friend lists, and message history in standard formats."
    },
    {
      question: "How do I report inappropriate behavior?",
      answer: "If you encounter spam, harassment, or inappropriate content, contact the admin team through the Settings page. Provide details about the user and behavior. Admins will investigate and take appropriate action."
    },
    {
      question: "What is the admin panel?",
      answer: "The Admin Panel is a management interface for system administrators. Only users with admin status (admin@admin.com by default) can access it. Admins can view all users, their identities, send platform notifications, and manage reported content."
    },
    {
      question: "How do I know if someone accepts my friend request?",
      answer: "You'll receive a notification when someone accepts your friend request. The friend will also appear in your Friends list for that context. You can then send messages or interact within that context."
    }
  ],

  // ============ SECURITY & PRIVACY ============
  security: {
    encryption: {
      title: "Message Encryption",
      method: "AES-256 Symmetric Encryption",
      description: "All messages are encrypted before storage using industry-standard AES-256 encryption. Only the sender and recipient can decrypt messages using their private keys.",
      benefits: [
        "End-to-end security",
        "Data unreadable in database",
        "Protection against breaches",
        "Compliance with privacy regulations"
      ]
    },
    authentication: {
      title: "User Authentication",
      method: "JWT (JSON Web Tokens) + bcrypt",
      description: "Users authenticate with email and password. Passwords are hashed with bcrypt before storage. JWT tokens enable secure, stateless session management.",
      benefits: [
        "Secure credential storage",
        "Scalable session management",
        "Protection against session hijacking",
        "Stateless architecture"
      ]
    },
    rateLimiting: {
      title: "Rate Limiting",
      description: "Failed login attempts are limited to 5 per 15 minutes per IP address. This prevents brute-force and credential stuffing attacks.",
      limit: "5 attempts per 15 minutes"
    },
    dataPrivacy: {
      title: "Data Privacy",
      gdprCompliant: true,
      principles: [
        "Data minimization - only necessary data collected",
        "Purpose limitation - data used only for stated purposes",
        "User control - users control their identity visibility",
        "Right to deletion - users can delete their accounts",
        "Right to access - users can export their data"
      ]
    },
    contextualAccess: {
      title: "Context-Based Access Control",
      description: "Users only see identity information appropriate to their relationship. Professional contacts cannot access personal information. This prevents unwanted data exposure.",
      examples: [
        "Professional friends see only professional identity",
        "Personal friends see only personal identity",
        "Family members see only family identity",
        "Online contacts see only online identity"
      ]
    }
  },

  // ============ TECHNOLOGY STACK ============
  techStack: {
    frontend: {
      framework: "Next.js 15.4.5",
      language: "TypeScript",
      styling: "TailwindCSS + Custom CSS",
      icons: "react-icons/fi (Feather Icons)",
      stateManagement: "React Hooks (useState, useContext, useEffect)",
      httpClient: "Fetch API",
      authentication: "JWT tokens in localStorage"
    },
    backend: {
      runtime: "Node.js",
      framework: "Express.js",
      language: "JavaScript",
      database: "MongoDB with Mongoose ODM",
      authentication: "JWT (jsonwebtoken) + bcrypt",
      encryption: "crypto (Node.js built-in) for AES encryption",
      middleware: "CORS, body-parser, helmet, rate-limiter"
    },
    database: {
      type: "MongoDB (NoSQL)",
      collections: [
        "users - User accounts and authentication",
        "identities - Multiple identity profiles per user",
        "friends - Friend relationships",
        "friendrequests - Pending friend requests",
        "messages - Encrypted messages",
        "notifications - User notifications",
        "favorites - Favorite connections"
      ]
    },
    deployment: {
      frontend: "Vercel or similar",
      backend: "Heroku, AWS, or similar",
      database: "MongoDB Atlas (Cloud)"
    }
  },

  // ============ API ENDPOINTS ============
  apiEndpoints: {
    authentication: [
      { method: "POST", path: "/api/auth/signup", description: "Register new user", auth: false },
      { method: "POST", path: "/api/auth/login", description: "Login user", auth: false },
      { method: "PUT", path: "/api/auth/update-profile", description: "Update profile info", auth: true },
      { method: "PUT", path: "/api/auth/change-password", description: "Change password", auth: true },
      { method: "DELETE", path: "/api/auth/delete-account", description: "Delete account", auth: true }
    ],
    identities: [
      { method: "POST", path: "/api/identities/create", description: "Create identity", auth: true },
      { method: "GET", path: "/api/identities", description: "Get all identities", auth: true },
      { method: "GET", path: "/api/identities/profile/:id", description: "Get identity profile", auth: false },
      { method: "PUT", path: "/api/identities/:id", description: "Update identity", auth: true },
      { method: "DELETE", path: "/api/identities/:id", description: "Delete identity", auth: true }
    ],
    friends: [
      { method: "POST", path: "/api/friends/add", description: "Follow user", auth: true },
      { method: "GET", path: "/api/friends/:context", description: "Get friends list", auth: true },
      { method: "GET", path: "/api/friends/check/:id/:context", description: "Check friendship", auth: true },
      { method: "POST", path: "/api/friends/remove", description: "Unfollow user", auth: true }
    ],
    friendRequests: [
      { method: "POST", path: "/api/friend-requests/send", description: "Send friend request", auth: true },
      { method: "GET", path: "/api/friend-requests/:context", description: "Get pending requests", auth: true },
      { method: "POST", path: "/api/friend-requests/accept", description: "Accept request", auth: true },
      { method: "POST", path: "/api/friend-requests/decline", description: "Decline request", auth: true }
    ],
    messages: [
      { method: "POST", path: "/api/messages/send", description: "Send message", auth: true },
      { method: "GET", path: "/api/messages/:context/:friendId", description: "Get conversation", auth: true },
      { method: "GET", path: "/api/messages/conversations/:context", description: "Get conversations", auth: true }
    ],
    notifications: [
      { method: "GET", path: "/api/notifications", description: "Get notifications", auth: true },
      { method: "PATCH", path: "/api/notifications/:id/mark-read", description: "Mark as read", auth: true },
      { method: "DELETE", path: "/api/notifications/:id", description: "Delete notification", auth: true }
    ],
    admin: [
      { method: "GET", path: "/api/admin/users", description: "Get all users", auth: true, adminOnly: true },
      { method: "POST", path: "/api/admin/send-notification", description: "Send notification", auth: true, adminOnly: true },
      { method: "DELETE", path: "/api/admin/identities/:id", description: "Delete identity", auth: true, adminOnly: true }
    ]
  },

  // ============ DATABASE SCHEMA ============
  database: {
    User: {
      fields: {
        _id: "ObjectId (auto-generated)",
        email: "String (unique, required)",
        password: "String (bcrypt hashed)",
        firstName: "String",
        lastName: "String",
        isAdmin: "Boolean (default: false)",
        createdAt: "Date (auto)",
        lastLogin: "Date"
      }
    },
    Identity: {
      fields: {
        _id: "ObjectId (auto-generated)",
        userId: "ObjectId (ref: User)",
        legalName: "String (required)",
        preferredName: "String (required)",
        nickname: "String",
        context: "String (enum: professional/personal/family/online)",
        accountPrivacy: "String (enum: public/private)",
        createdAt: "Date (auto)",
        updatedAt: "Date (auto)"
      }
    },
    Friend: {
      fields: {
        _id: "ObjectId (auto-generated)",
        userId: "ObjectId (ref: User)",
        friendIdentityId: "ObjectId (ref: Identity)",
        context: "String (enum: professional/personal/family/online)",
        createdAt: "Date (auto)"
      }
    },
    FriendRequest: {
      fields: {
        _id: "ObjectId (auto-generated)",
        senderUserId: "ObjectId (ref: User)",
        senderIdentityId: "ObjectId (ref: Identity)",
        recipientUserId: "ObjectId (ref: User)",
        recipientIdentityId: "ObjectId (ref: Identity)",
        context: "String (enum: professional/personal/family/online)",
        status: "String (enum: pending/accepted/declined)",
        createdAt: "Date (auto)"
      }
    },
    Message: {
      fields: {
        _id: "ObjectId (auto-generated)",
        senderUserId: "ObjectId (ref: User)",
        senderIdentityId: "ObjectId (ref: Identity)",
        recipientUserId: "ObjectId (ref: User)",
        recipientIdentityId: "ObjectId (ref: Identity)",
        message: "String (AES-256 encrypted)",
        context: "String (enum: professional/personal/family/online)",
        isRead: "Boolean (default: false)",
        createdAt: "Date (auto)"
      }
    },
    Notification: {
      fields: {
        _id: "ObjectId (auto-generated)",
        userId: "ObjectId (ref: User)",
        identityId: "ObjectId (ref: Identity)",
        title: "String",
        message: "String",
        identityType: "String (enum: professional/personal/family/online)",
        sentBy: "String (email of sender)",
        isRead: "Boolean (default: false)",
        createdAt: "Date (auto)"
      }
    }
  },

  // ============ COMMON ISSUES & TROUBLESHOOTING ============
  troubleshooting: [
    {
      issue: "I can't see a friend's profile",
      solutions: [
        "Ensure you are friends with them in that context",
        "They might have a private profile - send a friend request",
        "Check if you're looking in the correct context",
        "Their profile might be deleted or deactivated"
      ]
    },
    {
      issue: "My friend request isn't showing",
      solutions: [
        "Make sure the recipient exists in that context",
        "You might have already sent a request - wait for response",
        "Check if the recipient has a private profile",
        "Refresh the page and try again"
      ]
    },
    {
      issue: "I can't send a message",
      solutions: [
        "Ensure you're friends with the recipient in that context",
        "Check that both of you have created identities in that context",
        "The recipient might have removed you as a friend",
        "Try refreshing the page"
      ]
    },
    {
      issue: "Message notification not appearing",
      solutions: [
        "Refresh the notifications page",
        "Check that you're logged in",
        "Ensure the sender is your friend in that context",
        "Check browser notification settings"
      ]
    },
    {
      issue: "Can't log in to my account",
      solutions: [
        "Verify email and password are correct (case-sensitive)",
        "Check if you've exceeded login attempt limit (5 per 15 min)",
        "Ensure you registered an account first",
        "Try clearing browser cache and cookies"
      ]
    }
  ],

  // ============ BEST PRACTICES ============
  bestPractices: {
    privacy: [
      "Set Private profiles unless you want to be discovered",
      "Only accept friend requests from people you know",
      "Regularly review your friend lists",
      "Don't share sensitive information in messages",
      "Use strong, unique passwords"
    ],
    security: [
      "Never share your password with anyone",
      "Log out after using public computers",
      "Use different passwords for different accounts",
      "Enable notifications for suspicious activity",
      "Report inappropriate users to admins"
    ],
    usage: [
      "Create one identity per context for clarity",
      "Use descriptive preferred names for easy recognition",
      "Keep your bio updated in each context",
      "Respond to friend requests promptly",
      "Clean up old messages periodically"
    ]
  },

  // ============ ADMIN INFORMATION ============
  adminInfo: {
    defaultAdmin: {
      email: "admin@admin.com",
      password: "Anhar123",
      note: "Default admin credentials - change on first login"
    },
    adminCapabilities: [
      "View all users and their identities",
      "Send system-wide notifications",
      "Delete identities",
      "Monitor platform activity",
      "Manage reported content",
      "Suspend/activate user accounts"
    ],
    adminDashboardAccess: "/admin-dashboard",
    adminNotifications: {
      title: "Admin Notification System",
      description: "Send notifications to any user by selecting their identity and typing a message",
      format: "Title + Message to any user's identity"
    }
  },

  // ============ FEATURE ROADMAP ============
  roadmap: {
    v1_0: {
      version: "1.0 (Current)",
      features: [
        "Multiple identities per user",
        "Friend management system",
        "Encrypted messaging",
        "Search and discovery",
        "Notifications dashboard",
        "Admin panel",
        "Account settings",
        "Dark/Light theme"
      ]
    },
    v2_0: {
      version: "2.0 (Planned)",
      features: [
        "WebSocket real-time messaging",
        "File/image sharing",
        "User blocking",
        "Group messaging",
        "Message reactions",
        "Profile picture uploads",
        "Two-factor authentication",
        "Mobile app"
      ]
    },
    future: {
      version: "Future Versions",
      features: [
        "Video calls",
        "Voice messages",
        "AI-powered recommendations",
        "Privacy analytics",
        "Data export",
        "API for third-party integrations",
        "Advanced reporting tools"
      ]
    }
  }
};

module.exports = knowledge;
