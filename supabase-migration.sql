-- Create users table to store emails
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (optional, adjust as needed)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for email collection)
CREATE POLICY "Allow public insert" ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to read their own data (optional)
CREATE POLICY "Allow users to read own data" ON users
  FOR SELECT
  TO public
  USING (true);

-- Feature suggestions (post-trial offer: "want more minutes? suggest a feature")
CREATE TABLE IF NOT EXISTS feature_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  suggestion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_suggestions_email ON feature_suggestions(email);
CREATE INDEX IF NOT EXISTS idx_feature_suggestions_created_at ON feature_suggestions(created_at);

ALTER TABLE feature_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert feature_suggestions" ON feature_suggestions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow read feature_suggestions" ON feature_suggestions
  FOR SELECT
  TO public
  USING (true);
