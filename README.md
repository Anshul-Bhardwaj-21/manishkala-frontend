# Headless WordPress Frontend

Next.js App Router frontend for `https://manishkala.in`, using WordPress at `https://admin.manishkala.in` as the content source.

## Architecture

- Next.js App Router with TypeScript
- Tailwind CSS for the editorial interface
- Server Components for the core read path
- Native `fetch()` for WordPress REST requests
- WordPress REST API root: `WORDPRESS_API_URL`
- Public canonical origin: `NEXT_PUBLIC_SITE_URL`

Visible editorial content is fetched from WordPress. The frontend does not define article titles, excerpts, body copy, biography text, category labels, menus, social links, or author names.

## Environment

Create `.env.local` from `.env.example`.

```txt
NEXT_PUBLIC_SITE_URL=https://manishkala.in
WORDPRESS_BASE_URL=https://admin.manishkala.in
WORDPRESS_API_URL=https://admin.manishkala.in/wp-json
WORDPRESS_USERNAME=
WORDPRESS_APP_PASSWORD=
WORDPRESS_PREVIEW_SECRET=
SITE_REVALIDATE_SECRET=
```

`WORDPRESS_USERNAME` and `WORDPRESS_APP_PASSWORD` are used only by server-side preview reads.

## WordPress Endpoints

The typed client in `src/lib/wordpress.ts` reads:

- `GET /wp-json`
- `GET /wp/v2/menu-locations`
- `GET /wp/v2/menu-items?menus=<id>&per_page=100`
- `GET /wp/v2/categories?per_page=100&hide_empty=true`
- `GET /wp/v2/pages?slug=home`
- `GET /wp/v2/pages?slug=about`
- `GET /wp/v2/pages?slug=<slug>`
- `GET /wp/v2/posts?_embed`
- `GET /wp/v2/posts?slug=<slug>&_embed`
- `GET /wp/v2/media/<id>`

If menu endpoints are unavailable, navigation is derived from backend pages and categories.

## About Profile Fields

The public About page is backend-driven. In WordPress, edit the `about` page and use either the page Featured Image or an ACF image field named `portrait`, `photo`, `profile_photo`, or `about_photo` for the profile photo.

Optional ACF fields rendered on the About page:

- `instagram_url` or `instagram_handle`
- `phone`, `phone_number`, or `mobile`
- `email` or `email_address`
- `linkedin_url`
- `website`
- `drdo_achievements`, `career_highlights`, or `professional_highlights`

DRDO achievement cards on the homepage are pulled from published WordPress content assigned to a category slug such as `drdo-achievements`, `achievements`, `professional-achievements`, or from content marked with an ACF flag like `show_in_achievements`.

## Normalized Content Model

WordPress posts and legacy WordPress pages are normalized into a single article shape:

- `sourceType`: `post` or `page`
- `title`
- `contentHtml`
- `excerptText`
- `date`
- `modified`
- `author`
- `featuredImage`
- `categories`
- `acf`
- `yoast`

`/blog/[slug]` tries posts first, then pages. Blog listings and category filters prefer posts.

## Preview

Draft Mode is enabled through:

```txt
/api/preview?secret=<WORDPRESS_PREVIEW_SECRET>&type=post&slug=<slug>
/api/preview?secret=<WORDPRESS_PREVIEW_SECRET>&type=page&slug=<slug>
```

Preview fetches use server-side WordPress application-password authentication when the credential environment variables are present.

## Revalidation

Use:

```txt
/api/revalidate?secret=<SITE_REVALIDATE_SECRET>&slug=<slug>
/api/revalidate?secret=<SITE_REVALIDATE_SECRET>&path=/about
```

The handler revalidates route paths and shared WordPress cache tags.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run build
```

## Deployment

Deploy on Vercel, set the environment variables above, point the public domain to Vercel, and keep the admin subdomain pointed at the WordPress host.

If WordPress media is served from a different host, update `images.remotePatterns` in `next.config.ts`.
