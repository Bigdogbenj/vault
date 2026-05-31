import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://uglvomikdeejjkmbeykx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnbHZvbWlrZGVlamprbWJleWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDg2MTQsImV4cCI6MjA5NTc4NDYxNH0.MB_5K7YkjmtJrJUBLRBsYA8i-5T0FAn4vdCEqSU7cgI'
)
