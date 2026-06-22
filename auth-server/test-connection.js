const { Pool } = require('./node_modules/@types/pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:rising-sun@192.168.254.103:5432/postgres',
  connectionTimeoutMillis: 5000,
});

pool.query('SELECT NOW()')
  .then(res => {
    console.log('Success:', res.rows);
    pool.end();
  })
  .catch(err => {
    console.error('Error:', err);
    pool.end();
  });