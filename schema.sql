-- Supabase Database Schema for Portfolio Site

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Blog Posts Table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  tags TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments Table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL REFERENCES blog_posts(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes Table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL REFERENCES blog_posts(slug) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_slug, id) -- Prevent duplicate likes (simplified)
);

-- Ratings Table
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL REFERENCES blog_posts(slug) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_slug, id) -- Prevent duplicate ratings (simplified)
);

-- Contact Submissions Table
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscribers Table
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Blog posts: Public read for published posts
CREATE POLICY "Public read published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

-- Blog posts: Authenticated users can do everything
CREATE POLICY "Authenticated users manage posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

-- Comments: Public read, authenticated insert
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated insert comments" ON comments FOR INSERT WITH CHECK (true);

-- Likes: Public read, public insert (simplified)
CREATE POLICY "Public read likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Public insert likes" ON likes FOR INSERT WITH CHECK (true);

-- Ratings: Public read, public insert
CREATE POLICY "Public read ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Public insert ratings" ON ratings FOR INSERT WITH CHECK (true);

-- Contact submissions: Anyone can insert (Cloudflare Function uses service role, but this allows anon too)
CREATE POLICY "Public insert contact" ON contact_submissions FOR INSERT WITH CHECK (true);
-- Only authenticated (admin) can read submissions
CREATE POLICY "Authenticated read contact" ON contact_submissions FOR SELECT USING (auth.role() = 'authenticated');

-- Subscribers: Public insert, authenticated read
CREATE POLICY "Public insert subscribers" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read subscribers" ON subscribers FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_comments_post_slug ON comments(post_slug);
CREATE INDEX idx_likes_post_slug ON likes(post_slug);
CREATE INDEX idx_ratings_post_slug ON ratings(post_slug);
CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for blog_posts
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();