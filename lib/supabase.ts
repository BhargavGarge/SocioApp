import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fmpkzniscyyrzcdheufj.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcGt6bmlzY3l5cnpjZGhldWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NDY3OTcsImV4cCI6MjA1NTEyMjc5N30.Q3GN4pFcAc7oh8TgkA626bn4VEy8SGRbPV31P66kiW8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
// db123
