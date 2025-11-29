require('dotenv').config();

console.log("====== DEBUG .ENV ======");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE:", process.env.SUPABASE_SERVICE_ROLE);
console.log("========================");

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;
