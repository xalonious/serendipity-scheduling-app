export default {
    cors: {
      origins: ['http://localhost:5173'],
      credentials: true
    },
    auth: {
      jwt: {
        audience: 'localhost',
        issuer: 'localhost',
        secret: 'development-secret-key',
      },
      oauth: {
        redirectUri: 'http://localhost:8000/api/auth/roblox/callback',
    }    
    },
  };