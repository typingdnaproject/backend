// Update with your config settings.
require('dotenv').config();
module.exports = {

  development: {
    client: 'pg',
    useNullAsDefault: true,
    
    connection: {
      host: 'localhost',
      port: '5432',
      user: 'postgres',
      password:process.env.PASS,
      database: 'typingdna-db'
    },
    migrations: {
      directory: './db/migrations'
    }
  
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    ssl: {
      rejectUnauthorized: false
    }
  }

};