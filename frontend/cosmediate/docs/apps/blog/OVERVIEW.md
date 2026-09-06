# Blog App Overview

**Application**: Content Platform  
**Port**: 3003 (Development)  
**Domain**: `blog.cosmediate.com`  
**Purpose**: Educational content and resources about cosmetic treatments

---

## 📋 Description

The **Blog App** serves as the content platform for Cosmediate, providing educational articles, treatment guides, expert insights, and industry news related to cosmetic and dermatological procedures. It aims to educate users about treatments, build trust, and drive engagement.

### Key Responsibilities

- **Content Publishing**: Blog posts, articles, and guides
- **SEO Optimization**: Search engine friendly content structure
- **User Engagement**: Comments, likes, and shares
- **Content Discovery**: Categories, tags, and search
- **Author Management**: Multi-author support with profiles
- **Authentication Integration**: OAuth 2.0 for user interactions

---

## 🏗️ Architecture

### Application Type

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4 + shadcn/ui
- **Content**: Markdown/MDX (planned)
- **Backend Integration**: REST API for dynamic content

---

## ✅ Current Implementation Status

### Completed Features

#### 1. Authentication Setup

- **OAuth 2.0 integration** with auth app
- **Auth callback handler** (`/auth/callback`)
- **Protected routes** for authenticated features
- **Session management** with silent auth
- **User context** available throughout app

#### 2. Base Structure

- **Root layout** with global providers
- **Global styles** and theme configuration
- **Toast notifications** system
- **Responsive layout** foundation

### 🚧 Planned Features

#### Content Management

- [ ] **Blog post listing** - Grid/list view of articles
- [ ] **Individual post pages** - Full article view with rich content
- [ ] **Categories** - Organize posts by topic (Treatments, Skincare, News, etc.)
- [ ] **Tags** - Detailed topic tags for discovery
- [ ] **Search functionality** - Full-text search across posts
- [ ] **Featured posts** - Highlight important content

#### User Engagement

- [ ] **Comments system** - User discussions (requires auth)
- [ ] **Likes/reactions** - Engage with content
- [ ] **Share buttons** - Social media sharing
- [ ] **Bookmarks** - Save articles (authenticated users)
- [ ] **Reading history** - Track read articles

#### Author Features

- [ ] **Author profiles** - Specialist/expert bios
- [ ] **Author listing** - Browse by author
- [ ] **Author archives** - All posts by author
- [ ] **Guest contributors** - External experts

#### Content Features

- [ ] **Related posts** - Suggest similar content
- [ ] **Table of contents** - Navigate long articles
- [ ] **Reading time** - Estimated time to read
- [ ] **Newsletter signup** - Email subscriptions
- [ ] **RSS feed** - Content syndication

#### SEO & Performance

- [ ] **Meta tags** - OpenGraph, Twitter Cards
- [ ] **Structured data** - Schema.org markup
- [ ] **Sitemap generation** - XML sitemap
- [ ] **Image optimization** - Next.js Image component
- [ ] **Static generation** - ISR for performance

---

## 📝 Content Structure (Planned)

### Post Categories

1. **Treatment Guides** - In-depth procedure information
2. **Skincare Tips** - Daily care and maintenance
3. **Expert Interviews** - Specialist insights
4. **Industry News** - Latest developments
5. **Before & After** - Real patient stories
6. **FAQs** - Common questions answered

### Content Format

```markdown
---
title: "Understanding Botox: A Comprehensive Guide"
author: "Dr. Jane Smith"
date: "2024-12-11"
category: "Treatment Guides"
tags: ["botox", "injectables", "wrinkles"]
featuredImage: "/images/botox-guide.jpg"
excerpt: "Everything you need to know about Botox..."
---

# Content goes here...
```

---

## 🎨 UI Design (Planned)

### Homepage

- Hero section with featured post
- Latest posts grid (6-9 posts)
- Category navigation
- Newsletter signup
- Popular posts sidebar

### Post Listing Page

- Filter by category/tag
- Search bar
- Sort options (newest, popular, trending)
- Pagination or infinite scroll
- Author filter

### Individual Post Page

- Hero image
- Article metadata (author, date, reading time)
- Rich content (images, videos, embeds)
- Table of contents
- Author bio
- Related posts
- Comments section
- Share buttons

---

## 🔐 Authentication Integration

### Public Features (No Auth Required)

- Browse all posts
- Read full articles
- View categories and tags
- Author profiles

### Authenticated Features

- Comment on posts
- Like/react to content
- Bookmark articles
- Personalized recommendations
- Reading history

### OAuth Flow

1. User clicks "Sign in to comment"
2. Redirect to auth app via OAuth
3. Return with session
4. User can interact with content

---

## 📦 Dependencies

### Current

- `next`: ^15.x
- `react`: ^19.x
- `typescript`: ^5.x
- `@cosmediate/ui`: Shared components
- `@cosmediate/auth`: Authentication
- `tailwindcss`: ^4.x

### Planned

- `@next/mdx`: Markdown support
- `gray-matter`: Frontmatter parsing
- `remark`: Markdown processing
- `rehype`: HTML processing
- `reading-time`: Reading time calculation
- `date-fns`: Date formatting

---

## 🗂️ File Structure (Planned)

```
apps/blog/
├── src/
│   ├── app/
│   │   ├── (blog)/
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx          # Individual post
│   │   │   ├── category/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Category archive
│   │   │   ├── author/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Author archive
│   │   │   └── search/
│   │   │       └── page.tsx          # Search results
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # OAuth callback
│   │   ├── api/
│   │   │   ├── posts/                # Post API routes
│   │   │   ├── comments/             # Comments API
│   │   │   └── newsletter/           # Newsletter signup
│   │   └── layout.tsx
│   ├── content/
│   │   └── posts/                    # MDX blog posts
│   │       └── post-slug.mdx
│   ├── components/
│   │   ├── PostCard.tsx
│   │   ├── PostGrid.tsx
│   │   ├── CategoryNav.tsx
│   │   ├── CommentSection.tsx
│   │   └── ShareButtons.tsx
│   ├── lib/
│   │   ├── posts.ts                  # Post utilities
│   │   └── mdx.ts                    # MDX processing
│   └── context/
│       └── providers.tsx
└── public/
    └── images/
        └── posts/                    # Post images
```

---

## 🚀 Development

### Running Locally

```bash
# From monorepo root
pnpm dev --filter=blog

# Access at http://localhost:3003
```

### Environment Variables

```env
NEXT_PUBLIC_APP_NAME=blog
NEXT_PUBLIC_AUTH_BASE_URL=https://auth.cosmediate.com
NEXT_PUBLIC_API_BASE_URL=https://api.cosmediate.com

CLIENT_ID=blog_client_id
CLIENT_SECRET=hashed_secret
REDIRECT_URI=http://localhost:3003/auth/callback
```

---

## 🔮 Roadmap

### Phase 1: Foundation ✅

- [x] Authentication integration
- [x] Base layout and styling
- [x] Project structure

### Phase 2: Core Content (Next)

- [ ] MDX setup and configuration
- [ ] Blog post listing page
- [ ] Individual post pages
- [ ] Category and tag pages
- [ ] Basic SEO optimization

### Phase 3: User Engagement

- [ ] Comments system
- [ ] Likes and reactions
- [ ] Bookmarks functionality
- [ ] Share buttons
- [ ] Newsletter signup

### Phase 4: Advanced Features

- [ ] Full-text search
- [ ] Author profiles and archives
- [ ] Related posts algorithm
- [ ] Reading history
- [ ] Personalized recommendations

### Phase 5: CMS Integration

- [ ] Admin panel for content management
- [ ] Draft/publish workflow
- [ ] Content scheduling
- [ ] Media library
- [ ] Analytics dashboard

---

## 📚 Related Documentation

- [Authentication Integration](../auth/system-design/AUTH.MD)
- [Web App Homepage](../web/features/HOMEPAGE.md)
- [Content Guidelines](./CONTENT_GUIDELINES.md) (planned)
