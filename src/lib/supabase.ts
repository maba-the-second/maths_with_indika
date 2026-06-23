import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iyddqoixikmssyeyxcoo.supabase.co';
const supabaseAnonKey = 'sb_publishable_fPtnk_Vogq0CbjOxdPXW_w_-sBChbTz';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
