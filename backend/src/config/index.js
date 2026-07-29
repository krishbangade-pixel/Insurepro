require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  cors: {
    origin: (origin, callback) => {
      const allowed = [process.env.CORS_ORIGIN || 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];
      if (!origin || allowed.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  },
};
