# Isolate Community Platform

A powerful multi-tenant community management platform built with **Next.js**, **Supabase**, and **TypeScript**. Create unlimited communities with a single global ID, manage members with roles, and enable rich features like discussions, service desk, marketplace, and job board.

---

## 🌟 Features

### Core Platform
- **Single Global ID**: One account across all communities
- **Multi-Tenant Architecture**: Create and join unlimited communities
- **Role-Based Access Control**: Owner, Admin, Sub-Admin, Staff, Member
- **Universal Member Schema**: Flexible JSONB data for different community types

### Modules
- ✅ **Discussions**: Posts, comments, and emoji reactions
- ✅ **Groups**: Sub-communities within tenants
- ✅ **Service Desk**: Request tracking, assignments, and ratings
- ✅ **Marketplace**: Member-to-member listings and offers
- ✅ **Job Board**: Community job postings and applications

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- GitHub account (for deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/yahyaanas2005/isolate-community.git
cd isolate-community
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lyzbhvfjagpjquoufbhh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> **Note**: Get your Supabase keys from:  
> Supabase Dashboard → Project Settings → API

### 4. Run Database Migrations

Go to your Supabase SQL Editor and run the migrations in order:

1. `sql/02_universal_schema.sql` - Core tables (tenants, profiles, memberships)
2. `sql/05_mvp_schema.sql` - Posts, comments, reactions, groups
3. `sql/06_rls_policies.sql` - Row Level Security policies
4. `sql/07_additional_modules.sql` - Service Desk, Marketplace, Job Board
5. `sql/08_additional_rls.sql` - RLS for additional modules

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 6. Build for Production
```bash
npm run build
npm start
```

---

## 📊 Database Schema

### Core Tables
- **profiles**: User accounts (linked to auth.users)
- **tenants**: Communities/organizations
- **memberships**: User-tenant relationships with roles
- **groups**: Sub-communities within tenants

### Discussion Module
- **posts**: Community posts
- **comments**: Threaded comments
- **reactions**: Emoji reactions

### Service Desk Module
- **service_categories**: Request categories per community
- **service_requests**: Support requests with status/priority
- **service_request_activity**: Activity log

### Marketplace Module
- **marketplace_listings**: Items for sale
- **marketplace_offers**: Buyer offers on listings

### Job Board Module
- **job_posts**: Job postings
- **job_applications**: Applications to jobs

---

## 🔐 Authentication

The platform uses **Supabase Auth** with:
- Email/password authentication
- OAuth providers (Google, GitHub) support
- Automatic profile creation on signup
- Secure session management via middleware

---

## 👥 Roles & Permissions

### Role Hierarchy
**Owner** > **Admin** > **Sub-Admin** > **Staff** > **Member**

### Permission Matrix

| Action | Owner | Admin | Sub-Admin | Staff | Member |
|--------|-------|-------|-----------|-------|--------|
| Manage Community | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage Members | ✅ | ✅ | ❌ | ❌ | ❌ |
| Assign Service Requests | ✅ | ✅ | ✅ | ✅ | ❌ |
| Moderate Content | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create Posts | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Service Requests | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Listings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Post Jobs | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ API Routes

### Communities
- `POST /api/communities/create` - Create a new community
- `POST /api/communities/join` - Join a community

### Posts & Comments
- `POST /api/posts/create` - Create a post
- `POST /api/comments/create` - Add a comment
- `POST /api/reactions/toggle` - Toggle reaction

### Service Desk
- `POST /api/service/create` - Create service request
- `PATCH /api/service/update` - Update request status/assignment

### Marketplace
- `POST /api/marketplace/create` - Create listing
- `PATCH /api/marketplace/update` - Update listing

### Job Board
- `POST /api/jobs/create` - Create job post
- `PATCH /api/jobs/update` - Update job post

---

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub** (already done):
   ```bash
   git add .
   git commit -m "feat: complete platform implementation"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Set Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional, for server-side operations)

4. **Deploy**:
   - Vercel will automatically deploy on every `git push`
   - Production URL: https://your-project.vercel.app

### Supabase Configuration

1. **Enable Authentication Providers**:
   - Go to Authentication → Providers
   - Enable Email/Password
   - (Optional) Enable Google/GitHub OAuth

2. **Set Site URL**:
   - Go to Authentication → URL Configuration
   - Add your Vercel production URL

3. **Configure CORS** (if needed):
   - Go to Settings → API
   - Add your Vercel domain to allowed origins

---

## 📁 Project Structure

```
isolate-community/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── communities/
│   │   │   ├── posts/
│   │   │   ├── comments/
│   │   │   ├── reactions/
│   │   │   ├── service/      # Service Desk
│   │   │   ├── marketplace/
│   │   │   └── jobs/
│   │   ├── dashboard/        # Main app pages
│   │   ├── login/
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   │   ├── CreatePostModal.tsx
│   │   ├── AddMemberModal.tsx
│   │   ├── JoinCommunityModal.tsx
│   │   └── TenantContext.tsx
│   ├── lib/
│   │   ├── types.ts          # TypeScript types
│   │   └── permissions.ts    # Permission utilities
│   ├── utils/
│   │   └── supabase/         # Supabase clients
│   └── middleware.ts         # Auth middleware
├── sql/                      # Database migrations
│   ├── 02_universal_schema.sql
│   ├── 05_mvp_schema.sql
│   ├── 06_rls_policies.sql
│   ├── 07_additional_modules.sql
│   └── 08_additional_rls.sql
└── package.json
```

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Sign up with email/password
- [ ] Profile auto-created
- [ ] Login/logout works
- [ ] Session persists across page refreshes

#### Communities
- [ ] Create a community as Owner
- [ ] Join another community
- [ ] View correct role in each community
- [ ] Invite code works

#### Posts & Discussions
- [ ] Create a post
- [ ] Add comments
- [ ] React with emojis
- [ ] View post count

#### Service Desk
- [ ] Create service request
- [ ] Staff can assign requests
- [ ] Update request status
- [ ] Rate completed requests

#### Marketplace
- [ ] Create listing
- [ ] View community listings
- [ ] Make an offer
- [ ] Mark as sold

#### Job Board
- [ ] Post a job
- [ ] View job listings
- [ ] Apply to a job
- [ ] Close job posting

---

## 🔧 Extending the Platform

### Adding New Community Types
Edit `src/lib/types.ts`:
```typescript
export type CommunityType = 'Physical' | 'Professional' | 'Virtual' | 'YourNewType';
```

### Adding New Roles
Update the role hierarchy in `src/lib/permissions.ts`:
```typescript
const ROLE_HIERARCHY: UserRole[] = ['Member', 'YourRole', 'Staff', '...'];
```

### Adding Custom Fields to Members
Use the `dynamic_data` JSONB column in `memberships` table.

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)

---

## 📝 License

MIT License - feel free to use this project for your own communities!

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 📞 Support

- **GitHub Repo**: [yahyaanas2005/isolate-community](https://github.com/yahyaanas2005/isolate-community)
- **Issues**: Report bugs or request features via GitHub Issues

---

Built with ❤️ using Next.js and Supabase
