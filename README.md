# Maintenance & Reliability Engineer Portfolio

A professional portfolio website for Iyetu Barilogi, Maintenance & Reliability Engineer, built with Vanilla HTML, CSS, and JavaScript using Supabase for backend services and Cloudflare Pages Functions for serverless API handling.

## Features

- **Responsive Design**: Two-column hero layout that stacks on mobile
- **Blog System**: Full blog with posts, comments, likes, and 1-5 star ratings
- **Admin Portal**: Supabase-authenticated admin interface for blog management
- **Contact Form**: Form submissions stored in Supabase and emailed via Resend API
- **Newsletter Signup**: Subscriber management with welcome emails
- **Serverless Backend**: Cloudflare Pages Functions for secure API handling

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Backend**: Cloudflare Pages Functions
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend API
- **Authentication**: Supabase Auth

## Project Structure

```
/
├── index.html          # Main portfolio page
├── admin.html          # Admin portal for blog management
├── blog.html           # Blog listing page
├── post.html           # Individual blog post page
├── style.css           # All styles
├── app.js              # Supabase initialization and utilities
├── auth.js             # Admin authentication
├── blog.js             # Blog CRUD operations
├── functions/
│   ├── contact.js      # Contact form handler
│   └── subscribe.js    # Newsletter subscription handler
└── schema.sql          # Database schema
```

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database and note your database password
4. Run the SQL schema in `schema.sql` in the Supabase SQL editor

### 2. Environment Variables

Set these environment variables in your Cloudflare Pages dashboard:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
```

### 3. Resend API Setup

1. Create an account at [resend.com](https://resend.com)
2. Get your API key
3. Verify your domain for sending emails

### 4. Update Configuration

Update the following files with your actual values:

**app.js**:
```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

**functions/contact.js** and **functions/subscribe.js**:
- Update the `from` email addresses to your verified domain
- Update the `to` email in contact.js to your email address

### 5. Admin User Setup

Create an admin user in Supabase Auth:
1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add user"
3. Enter admin email and password
4. This user will be able to access the admin portal

### 6. Deployment

1. Push this code to a Git repository
2. Connect the repository to Cloudflare Pages
3. Set the build command to `No build command` (static site)
4. Set the build output directory to `/`
5. Add the environment variables in the Pages dashboard
6. Deploy!

## Usage

### Admin Portal

- Navigate to `admin.html`
- Login with your admin credentials
- Manage blog posts, view comments

### Blog Features

- View posts on `blog.html`
- Click post titles to read full articles
- Like posts and leave ratings/comments
- Subscribe to newsletter in footer

### Contact Form

- Fill out the contact form on the homepage
- Submissions are stored in Supabase and emailed to you

## Development

To run locally:

1. Clone the repository
2. Open `index.html` in your browser
3. For full functionality, deploy to Cloudflare Pages with proper environment variables

## Security Notes

- Row Level Security (RLS) is enabled on all Supabase tables
- Admin operations require authentication
- API keys are stored as environment variables
- Contact form submissions are validated server-side

## Customization

- Update colors and branding in `style.css`
- Modify content in the HTML files
- Add new blog features by extending the Supabase schema and updating the JavaScript files

## License

© 2025 Iyetu Barilogi. All rights reserved.</content>
<parameter name="filePath">c:\Users\raymo\Downloads\Pius portfolio site\README.md