name: "Blog: Backend storage + Minimal Admin Publisher"
description: |
  Backend-powered blog with a simple in-app admin page to create/publish posts. Role-gated access using Supabase user metadata. Minimal, production-safe.

## Goal
- Store blog posts server-side.
- Admin-only publishing UX with create, edit, delete.
- Publish-only (no drafts/scheduling for MVP).
- Frontend list/article read from API (no redeploy for content changes).

## Why
- Decouple content from code deploys.
- Enable quick publishing with authentication and roles.
- Keep MVP lightweight, aligned with existing FastAPI/Supabase patterns.

## What
- Database table `blog_posts` with basic fields and indexes.
- Public endpoints: list + article by slug (published only).
- Admin endpoints: create, edit, delete (role=admin required).
- Frontend: `/admin` landing, `/admin/blog/new` form, `/admin/blog/:id/edit` form.
- Route guards: admin-only access.
- Optional image upload for cover image (and reusable asset URLs) via Supabase Storage.
- Slug policy: auto-generate from title with override; on collision append `-2`, `-3`, ...
- Content: paste plain text into fields; markdown supported but not required.
- Delete behavior: hard delete (no `deleted_at`, no undo) to keep MVP simple.
- Slug edits: allowed; no redirects are created (old slug becomes invalid).

### Success Criteria
- [ ] Admin can sign in and access `/admin/blog/new`.
- [ ] Creating a post via form persists to DB and appears on `/blog`.
- [ ] Admin can edit and delete posts from an `/admin` landing.
- [ ] Non-admin cannot access the admin page or POST API (403).
- [ ] Blog list/article read from backend, not static file.
- [ ] Basic loading/error states; markdown content renders.
- [ ] Image upload works (cover image optional). When provided, image displays on list/article.
- [ ] Slug auto-generation with collision handling is deterministic and predictable.

## Desired Codebase Changes
- backend/
  - `migrations/024_create_blog_posts.sql`: create `blog_posts`.
  - `app/api/blog.py`: GET `/api/blog`, GET `/api/blog/{slug}`, POST `/api/blog` (admin-only), PUT `/api/blog/{id}` (admin-only), DELETE `/api/blog/{id}` (admin-only), POST `/api/blog/upload-image` (admin-only, multipart/form-data → Supabase Storage → returns URL).
  - `app/main.py`: include `blog.router` with `/api` prefix.
- frontend/
  - `src/hooks/useBlogs.js`: `useBlogPosts`, `useBlogPost(slug)` fetch via `getConfig().apiUrl`.
  - `src/components/AdminRoute.jsx`: role check wrapper (Supabase `user_metadata.role === 'admin'`).
  - `src/pages/Admin/BlogPostForm.jsx`: form (title, slug, author, excerpt, content, cover_image_url, cover_image_alt, tags[], published, optional image file input + upload button that calls `/api/blog/upload-image` and fills `cover_image_url`), live preview pane (markdown + cover image).
  - `src/pages/Admin/AdminHome.jsx`: simple table of posts with New/Edit/Delete actions.
  - `src/App.jsx`: add route `/admin/blog/new` guarded by `AdminRoute`.
  - `src/App.jsx`: add `/admin` and `/admin/blog/:id/edit` guarded by `AdminRoute`.
  - Update `pages/Blog/BlogList.jsx` and `BlogArticle.jsx` to use hooks (remove static import).
  - Optional: add `react-markdown` to render article content.
  - Optional: small inline image helper in admin form to upload arbitrary images and copy their URLs into content.

## Implementation Tasks (order)
1) Database migration: `blog_posts`
   - Columns: `slug` (unique), `title`, `author`, `excerpt`, `content` (markdown/text), `cover_image_url`, `cover_image_alt`, `tags` (text[] nullable), `published` (bool), `published_at`, `created_at`, `updated_at`.
   - Index on `(published desc, published_at desc)` and on `slug`.

2) Backend API (FastAPI)
   - `GET /api/blog`: list published posts (paginated, default limit 10; fields: `slug,title,author,excerpt,cover_image_url,published_at`).
   - `GET /api/blog/{slug}`: single published post or 404.
   - `POST /api/blog`: admin-only create; validate required fields; default `published_at = now()` if `published=true`; auto-generate slug from title if blank; on slug collision, append numeric suffix.
   - `PUT /api/blog/{id}`: admin-only update (same validations as create; allow slug change with collision handling).
   - `DELETE /api/blog/{id}`: admin-only delete.
   - `POST /api/blog/upload-image`: admin-only; accepts `file` (multipart), validates type and size (png|jpg|jpeg|webp, ≤5MB), uploads to Supabase Storage bucket `blog-images` under `YYYY/MM/slug-or-uuid/filename`, returns public URL; to be used by admin form to populate `cover_image_url` or inline assets.
   - Admin check: use `get_user_role` (Supabase `user_metadata.role`) and return 403 if not `'admin'`.
   - Mount router in `main.py`.

3) Frontend data hooks
   - `useBlogPosts()` and `useBlogPost(slug)` with loading/error states and `getConfig().apiUrl`.

4) Admin route
   - `AdminRoute`: reuse `useAuth()`; ensure `user?.user_metadata?.role === 'admin'`.
   - Guard `/admin/blog/new`.

5) Admin publishing page
   - Form: `title`, `slug`, `author` (default “FairPlay Team”), `excerpt`, `content` (textarea), `cover_image_url`, `cover_image_alt`, `tags` (comma-separated, optional), `published` (checkbox), `image` (optional file input).
   - Image flow: choose file → click “Upload Image” → POST to `/api/blog/upload-image` → receive URL → auto-fill `cover_image_url` (and show copy button for content embedding).
   - Create: POST to `/api/blog` with Bearer token from Supabase session.
   - Edit: load by slug or id; save via `PUT /api/blog/{id}`.
   - Delete: action from admin landing using `DELETE /api/blog/{id}` with confirm dialog.
   - Live preview: side-by-side preview using markdown renderer and cover image.
   - On create/update success: toast + navigate to `/blog/{slug}`.

6) Blog readers
   - Replace static data with hooks in `BlogList.jsx`/`BlogArticle.jsx`.
   - Render content via `react-markdown` (sanitized) for headings/lists/links.
   - Show cover image (if present) on list and article; compute reading time by word count (client-side) and display alongside author/date.

7) Tests (Jest + RTL)
   - `AdminRoute` denies non-admin; allows admin.
   - Blog form submits and shows success path (mock fetch).
   - Image upload: mocks multipart request to `/api/blog/upload-image` and verifies `cover_image_url` is populated and preview renders.
   - Blog list fetches and renders items; article by slug renders markdown.

8) Docs
   - Assign admin: set `role: "admin"` in Supabase user metadata for `wachtelj22@gmail.com`; sign out/in to refresh JWT.
   - Supabase Storage: create bucket `blog-images` (public) for blog assets; optionally apply a folder structure policy; ensure CORS is configured for Render domain.
   - Environments: production storage only for MVP per request; dev/staging can reuse or skip.

## Migration SQL (024_create_blog_posts.sql)
```sql
create table if not exists public.blog_posts (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  author text not null default 'FairPlay Team',
  excerpt text,
  content text not null,
  cover_image_url text,
  cover_image_alt text,
  tags text[],
  published boolean not null default true,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_published_at on public.blog_posts (published desc, published_at desc);
create index if not exists idx_blog_posts_slug on public.blog_posts (slug);
```

## Open Questions / Assumptions
- Markdown supported but not required; fields accept pasted text.
- Public bucket is acceptable for images.
- Max size/types: ≤5MB; png/jpg/jpeg/webp.
- Client-side crop/resize: omitted for MVP; add later if needed.
- Inline image helper: include simple upload → copy URL flow in admin form.
- SEO: add meta title/description; OpenGraph image uses cover; canonical to `/blog/:slug`.
- Taxonomy: add optional `tags` (text[]); UI may ignore initially.
- Pagination: default 10 per page.
- UI: show cover image on list and article; show author/date and computed reading time.
- Access UX: add `/admin` landing after admin logs in.
- Environments: storage configured for production only for MVP.
- Analytics: skip view tracking for MVP to avoid write-on-read.
- Testing scope: include upload failure cases and slug collision handling.

## Validation
- `npm test` passes; new tests added for admin route, form submit, list/article rendering.
- Manual: sign in as admin, publish a post, verify on `/blog` and `/blog/:slug`.
- Non-admin or signed-out access to `/admin/blog/new` blocked; POST returns 403.

## Risks/Gotchas
- Ensure `role` present in Supabase JWT (user metadata). If missing, refresh session after metadata update.
- Sanitize markdown rendering.
- Slug uniqueness enforced in DB; show clear API error in form on conflict.
- Restrict file types and size on both client and server; prefer web-friendly formats; handle failures gracefully.

name: "Blog: Backend storage + Minimal Admin Publisher"
description: |
  Backend-powered blog with a simple in-app admin page to create/publish posts. Role-gated access using Supabase user metadata. Minimal, production-safe.

## Goal
- Store blog posts server-side.
- Admin-only publishing UX with create, edit, delete.
- Publish-only (no drafts/scheduling for MVP).
- Frontend list/article read from API (no redeploy for content changes).

## Why
- Decouple content from code deploys.
- Enable quick publishing with authentication and roles.
- Keep MVP lightweight, aligned with existing FastAPI/Supabase patterns.

## What
- Database table `blog_posts` with basic fields and indexes.
- Public endpoints: list + article by slug (published only).
- Admin endpoints: create, edit, delete (role=admin required).
- Frontend: `/admin` landing, `/admin/blog/new` form, `/admin/blog/:id/edit` form.
- Route guards: admin-only access.
- Optional image upload for cover image (and reusable asset URLs) via Supabase Storage.
- Slug policy: auto-generate from title with override; on collision append `-2`, `-3`, ...
- Content: paste plain text into fields; markdown supported but not required.
 - Delete behavior: hard delete (no `deleted_at`, no undo) to keep MVP simple.
 - Slug edits: allowed; no redirects are created (old slug becomes invalid).

### Success Criteria
- [ ] Admin can sign in and access `/admin/blog/new`.
- [ ] Creating a post via form persists to DB and appears on `/blog`.
- [ ] Admin can edit and delete posts from an `/admin` landing.
- [ ] Non-admin cannot access the admin page or POST API (403).
- [ ] Blog list/article read from backend, not static file.
- [ ] Basic loading/error states; markdown content renders.
 - [ ] Image upload works (cover image optional). When provided, image displays on list/article.
 - [ ] Slug auto-generation with collision handling is deterministic and predictable.

## Desired Codebase Changes
- backend/
  - `migrations/024_create_blog_posts.sql`: create `blog_posts`.
  - `app/api/blog.py`: GET `/api/blog`, GET `/api/blog/{slug}`, POST `/api/blog` (admin-only), PUT `/api/blog/{id}` (admin-only), DELETE `/api/blog/{id}` (admin-only), POST `/api/blog/upload-image` (admin-only, multipart/form-data → Supabase Storage → returns URL).
  - `app/main.py`: include `blog.router` with `/api` prefix.
- frontend/
  - `src/hooks/useBlogs.js`: `useBlogPosts`, `useBlogPost(slug)` fetch via `getConfig().apiUrl`.
  - `src/components/AdminRoute.jsx`: role check wrapper (Supabase `user_metadata.role === 'admin'`).
   - `src/pages/Admin/BlogPostForm.jsx`: form (title, slug, author, excerpt, content, cover_image_url, cover_image_alt, tags[], published, optional image file input + upload button that calls `/api/blog/upload-image` and fills `cover_image_url`), live preview pane (markdown + cover image).
  - `src/pages/Admin/AdminHome.jsx`: simple table of posts with New/Edit/Delete actions.
  - `src/App.jsx`: add route `/admin/blog/new` guarded by `AdminRoute`.
  - `src/App.jsx`: add `/admin` and `/admin/blog/:id/edit` guarded by `AdminRoute`.
  - Update `pages/Blog/BlogList.jsx` and `BlogArticle.jsx` to use hooks (remove static import).
  - Optional: add `react-markdown` to render article content.
  - Optional: small inline image helper in admin form to upload arbitrary images and copy their URLs into content.

## Implementation Tasks (order)
1) Database migration: `blog_posts`
   - Columns: `slug` (unique), `title`, `author`, `excerpt`, `content` (markdown/text), `cover_image_url`, `cover_image_alt`, `tags` (text[] nullable), `published` (bool), `published_at`, `created_at`, `updated_at`.
   - Index on `(published desc, published_at desc)` and on `slug`.

2) Backend API (FastAPI)
   - `GET /api/blog`: list published posts (paginated, default limit 10; fields: `slug,title,author,excerpt,cover_image_url,published_at`).
   - `GET /api/blog/{slug}`: single published post or 404.
   - `POST /api/blog`: admin-only create; validate required fields; default `published_at = now()` if `published=true`; auto-generate slug from title if blank; on slug collision, append numeric suffix.
   - `PUT /api/blog/{id}`: admin-only update (same validations as create; allow slug change with collision handling).
   - `DELETE /api/blog/{id}`: admin-only delete.
   - `POST /api/blog/upload-image`: admin-only; accepts `file` (multipart), validates type and size (png|jpg|jpeg|webp, ≤5MB), uploads to Supabase Storage bucket `blog-images` under `YYYY/MM/slug-or-uuid/filename`, returns public URL; to be used by admin form to populate `cover_image_url` or inline assets.
   - Admin check: use `get_user_role` (Supabase `user_metadata.role`) and return 403 if not `'admin'`.
   - Mount router in `main.py`.

3) Frontend data hooks
   - `useBlogPosts()` and `useBlogPost(slug)` with loading/error states and `getConfig().apiUrl`.

4) Admin route
   - `AdminRoute`: reuse `useAuth()`; ensure `user?.user_metadata?.role === 'admin'`.
   - Guard `/admin/blog/new`.

5) Admin publishing page
   - Form: `title`, `slug`, `author` (default “FairPlay Team”), `excerpt`, `content` (textarea), `cover_image_url`, `cover_image_alt`, `tags` (comma-separated, optional), `published` (checkbox), `image` (optional file input).
   - Image flow: choose file → click “Upload Image” → POST to `/api/blog/upload-image` → receive URL → auto-fill `cover_image_url` (and show copy button for content embedding).
   - Create: POST to `/api/blog` with Bearer token from Supabase session.
   - Edit: load by slug or id; save via `PUT /api/blog/{id}`.
   - Delete: action from admin landing using `DELETE /api/blog/{id}` with confirm dialog.
   - Live preview: side-by-side preview using markdown renderer and cover image.
   - On create/update success: toast + navigate to `/blog/{slug}`.

6) Blog readers
   - Replace static data with hooks in `BlogList.jsx`/`BlogArticle.jsx`.
   - Render content via `react-markdown` (sanitized) for headings/lists/links.
   - Show cover image (if present) on list and article; compute reading time by word count (client-side) and display alongside author/date.

7) Tests (Jest + RTL)
   - `AdminRoute` denies non-admin; allows admin.
   - Blog form submits and shows success path (mock fetch).
   - Image upload: mocks multipart request to `/api/blog/upload-image` and verifies `cover_image_url` is populated and preview renders.
   - Blog list fetches and renders items; article by slug renders markdown.

8) Docs
   - Assign admin: set `role: "admin"` in Supabase user metadata for your account; sign out/in to refresh JWT.
    - Supabase Storage: create bucket `blog-images` (public) for blog assets; optionally apply a folder structure policy; ensure CORS is configured for Render domain.
    - Admin accounts: set Supabase user metadata `role = "admin"` for `wachtelj22@gmail.com`.

## Migration SQL (024_create_blog_posts.sql)
```sql
create table if not exists public.blog_posts (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  author text not null default 'FairPlay Team',
  excerpt text,
  content text not null,
  cover_image_url text,
  cover_image_alt text,
  tags text[],
  published boolean not null default true,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_published_at on public.blog_posts (published desc, published_at desc);
create index if not exists idx_blog_posts_slug on public.blog_posts (slug);
```

## Open Questions / Assumptions
- Markdown supported but not required; fields accept pasted text.
- Public bucket is acceptable for images.
- Max size/types: ≤5MB; png/jpg/jpeg/webp.
- Client-side crop/resize: omitted for MVP; add later if needed.
- Inline image helper: include simple upload → copy URL flow in admin form.
- SEO: add meta title/description; OpenGraph image uses cover; canonical to `/blog/:slug`.
- Taxonomy: add optional `tags` (text[]); UI may ignore initially.
- Pagination: default 10 per page.
- UI: show cover image on list and article; show author/date and computed reading time.
- Access UX: add `/admin` landing after admin logs in.
- Environments: storage configured for production only for MVP.
- Analytics: skip view tracking for MVP to avoid write-on-read.
- Testing scope: include upload failure cases and slug collision handling.

## Validation
- `npm test` passes; new tests added for admin route, form submit, list/article rendering.
- Manual: sign in as admin, publish a post, verify on `/blog` and `/blog/:slug`.
- Non-admin or signed-out access to `/admin/blog/new` blocked; POST returns 403.

## Risks/Gotchas
- Ensure `role` present in Supabase JWT (user metadata). If missing, refresh session after metadata update.
- Sanitize markdown rendering.
- Slug uniqueness enforced in DB; show clear API error in form on conflict.
 - Restrict file types and size on both client and server; prefer web-friendly formats; handle failures gracefully.


