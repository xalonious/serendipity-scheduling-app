export default {
    log: {
      level: 'info', 
      disabled: false,
    },
    cors: {
      maxAge: 3 * 60 * 60, 
    },
    auth: {
      jwt: {
        expirationInterval: '12h', 
      },
    },
  };