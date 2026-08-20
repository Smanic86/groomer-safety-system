/**
 * Groomer Safety System
 * Copyright (c) 2026 Shaun Hancock. All rights reserved.
 * Confidential and Proprietary.
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fhoiqtsikfzpqjfhwtej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZob2lxdHNpa2Z6cHFqZmh3dGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzNDM1NjIsImV4cCI6MjEwMTkxOTU2Mn0.pAU6E586-EC65XZwTfB9967UAP1VjhMiiIm4wfrrAQQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});