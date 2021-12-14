import dotenv from 'dotenv';
dotenv.config();
const env = process.env.NODE_ENV;

const configs = {
  local: {
    secret: process.env.JWT_SECRET,
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'local',
    dbUrl: process.env.DBURL_LOCAL,
  },
  development: {
    secret: process.env.JWT_SECRET,
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    dbUrl: process.env.DBURL_STAGING,
  },
  production: {
    secret: process.env.JWT_SECRET,
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'production',
    dbUrl: process.env.DBURL_PROD,
  },
};

module.exports = configs[env];
