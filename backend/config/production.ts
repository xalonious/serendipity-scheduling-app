export default {
    cors: {
      origins: ['https://rbxserendipity.com'],
      credentials: true
    },
    auth: {
      jwt: {
        audience: 'rbxserendipity.com',
        issuer: 'rbxserendipity.com',
        secret: process.env.AUTH_JWT_SECRET, 
      },
      oauth: {
        redirectUri: 'https://api.rbxserendipity.com/api/auth/roblox/callback',
    }
    },
  };