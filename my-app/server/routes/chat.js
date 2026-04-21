const express = require('express');
const Groq = require('groq-sdk');
const authenticateToken = require('../middleware/auth');
const knowledge = require('../knowledge');

const router = express.Router();

// Validate API key on startup
if (!process.env.GROQ_API_KEY) {
  console.error('⚠️  GROQ_API_KEY is not set in environment variables');
} else if (process.env.GROQ_API_KEY.length < 20) {
  console.error('⚠️  GROQ_API_KEY appears to be invalid (too short)');
} else {
  console.log('✓ GROQ_API_KEY is configured');
}

// Initialize Groq API
let groq = null;
try {
  if (process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
} catch (err) {
  console.error('Error initializing Groq AI:', err.message);
}

// System prompt with knowledge base context
const SYSTEM_PROMPT = `You are an intelligent chatbot assistant for the Identity Management System (IMS), a platform that helps users manage multiple identity profiles across different contexts (professional, personal, family, online).

IMPORTANT GUIDELINES:
1. Be helpful, friendly, and professional
2. Always refer to the knowledge base for accurate information
3. If a user asks something not covered, be honest and suggest contacting support
4. Use the user's context to provide relevant examples
5. Provide step-by-step guides when explaining how-to tasks
6. Maintain a conversational tone
7. Keep responses concise but comprehensive

AVAILABLE FEATURES:
${JSON.stringify(Object.keys(knowledge.features), null, 2)}

CONTEXT TYPES:
${knowledge.identityTypes.professional.name} - ${knowledge.identityTypes.professional.description}
${knowledge.identityTypes.personal.name} - ${knowledge.identityTypes.personal.description}
${knowledge.identityTypes.family.name} - ${knowledge.identityTypes.family.description}
${knowledge.identityTypes.online.name} - ${knowledge.identityTypes.online.description}

SECURITY & PRIVACY:
- All messages are encrypted using AES-256 encryption
- Passwords are hashed with bcrypt
- Data is protected by GDPR compliance
- Context-based access control ensures privacy
- Users have full control over their identity visibility

KEY FEATURES:
- Create up to 4 identity profiles for different life contexts
- Send encrypted messages to friends
- Send and manage friend requests
- Search and discover other users
- Receive real-time notifications
- Manage account settings and privacy preferences
- Admin panel for platform moderation (admin only)

COMMON QUESTIONS TO HANDLE:
- Account creation and authentication
- Identity profile management
- Friend requests and connections
- Messaging and notifications
- Privacy and security
- Troubleshooting issues
- Feature explanations
- How-to guides

Remember to:
✓ Reference specific API endpoints when relevant
✓ Explain privacy and security benefits
✓ Provide clear step-by-step instructions
✓ Suggest using Search feature for discovery
✓ Explain context separation benefits
✓ Mention notification system for updates
`;

// Format knowledge base for context injection
const formatKnowledgeBase = () => {
  return `
KNOWLEDGE BASE REFERENCE:

FAQ:
${knowledge.faq.map((item, idx) => `Q${idx + 1}: ${item.question}\nA${idx + 1}: ${item.answer}`).join('\n\n')}

HOW-TO GUIDES:
${Object.entries(knowledge.howToGuides).map(([key, guide]) => {
    return `\n${guide.title}:\n${Array.isArray(guide.steps) ? guide.steps.map((s, i) => {
      if (typeof s === 'string') return `${i + 1}. ${s}`;
      return `${s.step}. ${s.title} - ${s.description}`;
    }).join('\n') : ''}`;
  }).join('\n')}

SECURITY INFORMATION:
- Encryption: ${knowledge.security.encryption.method}
- Authentication: ${knowledge.security.authentication.method}
- Rate Limiting: ${knowledge.security.rateLimiting.limit}
- GDPR Compliant: ${knowledge.security.dataPrivacy.gdprCompliant}

TROUBLESHOOTING:
${knowledge.troubleshooting.map((t, i) => `Issue ${i + 1}: ${t.issue}\nSolutions: ${t.solutions.join(', ')}`).join('\n\n')}

API ENDPOINTS (for developers):
Authentication: POST /api/auth/signup, POST /api/auth/login, PUT /api/auth/update-profile
Identities: POST /api/identities/create, GET /api/identities, DELETE /api/identities/:id
Friends: POST /api/friends/add, GET /api/friends/:context
Messages: POST /api/messages/send, GET /api/messages/:context/:friendId
Notifications: GET /api/notifications, PATCH /api/notifications/:id/mark-read

PROJECT INFO:
- Name: ${knowledge.projectOverview.name}
- Version: ${knowledge.projectOverview.version}
- Developers: ${knowledge.projectOverview.developers.join(', ')}
- Institution: ${knowledge.projectOverview.institution}
  `;
};

// POST /api/chat - Accept message and return AI response
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Message is required and must be non-empty',
        reply: 'Please provide a valid message. How can I help you with the Identity Management System?' 
      });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return res.status(500).json({ 
        error: 'API key not configured',
        reply: 'The chatbot service is not properly configured. Please contact your administrator.' 
      });
    }

    if (!groq) {
      console.error('Groq API client failed to initialize');
      return res.status(500).json({ 
        error: 'Chatbot service unavailable',
        reply: 'The chatbot service is temporarily unavailable. Please try again later.' 
      });
    }

    console.log('Chat request received:', message.substring(0, 50) + '...');

    // Create comprehensive prompt with knowledge base
    const knowledgeContext = formatKnowledgeBase();
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${knowledgeContext}\n\nUser Question: ${message}`;

    // Call Groq API
    console.log('Calling Groq API (llama-3.3-70b-versatile)...');
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `${knowledgeContext}\n\nUser Question: ${message}`
        }
      ],
      max_tokens: 1024,
      temperature: 0.7
    });

    const reply = result.choices[0].message.content;

    console.log('Chat response generated successfully');

    // Return the AI response
    res.status(200).json({
      success: true,
      message: message,
      reply: reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'I encountered an error processing your request. Please try again.';
    let statusCode = 500;
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('Authentication') || error.status === 401) {
      errorMessage = 'The chatbot API key is invalid or has expired. Please check the configuration.';
      console.error('API Key Error: The GROQ_API_KEY is invalid. Please verify:');
      console.error('1. The API key is correct and valid');
      console.error('2. The API key has not been revoked');
      console.error('3. The Groq API key has appropriate permissions');
    } else if (error.status === 403) {
      errorMessage = 'Access denied. The API key does not have the required permissions.';
      console.error('Permission Error: Ensure the API key has access to the Generative AI API');
    } else if (error.status === 400) {
      errorMessage = 'Invalid request format. Please try again with a different message.';
    } else if (error.message?.includes('rate')) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
      statusCode = 429;
    } else if (error.message?.includes('network') || error.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }

    res.status(statusCode).json({
      error: error.message || 'Failed to generate response',
      reply: errorMessage
    });
  }
});

// GET /api/chat/knowledge - Return knowledge base summary (for debugging)
router.get('/knowledge-summary', authenticateToken, async (req, res) => {
  try {
    const summary = {
      projectName: knowledge.projectOverview.name,
      featuresCount: Object.keys(knowledge.features).length,
      faqCount: knowledge.faq.length,
      guidesCount: Object.keys(knowledge.howToGuides).length,
      troubleshootingTopics: knowledge.troubleshooting.length,
      identityTypes: Object.keys(knowledge.identityTypes),
      apiEndpoints: {
        authentication: knowledge.apiEndpoints.authentication.length,
        identities: knowledge.apiEndpoints.identities.length,
        friends: knowledge.apiEndpoints.friends.length,
        messages: knowledge.apiEndpoints.messages.length,
        notifications: knowledge.apiEndpoints.notifications.length,
        admin: knowledge.apiEndpoints.admin.length
      }
    };

    res.status(200).json({
      success: true,
      summary: summary,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Knowledge summary error:', error);
    res.status(500).json({
      error: 'Failed to retrieve knowledge summary',
      message: error.message
    });
  }
});

// GET /api/chat/health - Health check
router.get('/health', (req, res) => {
  const groqConfigured = !!process.env.GROQ_API_KEY;
  
  res.status(200).json({
    success: true,
    chatbotStatus: groqConfigured ? 'operational' : 'not configured',
    groqApiKey: groqConfigured ? 'configured' : 'missing',
    model: 'llama-3.3-70b-versatile',
    knowledgeBase: 'loaded',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
