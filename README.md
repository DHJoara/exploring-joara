# Exploring Joara

Based on the Payload Blank Template, with the reviewed Joara exhibit pages, collections, and globals.

## Quick start

This application uses the template’s SQLite adapter and the official S3 storage adapter. It can run on any host that supports Next.js and persistent SQLite storage.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables. Set a random PAYLOAD_SECRET and a DATABASE_URL pointing to a SQLite file. The example uses file:./exploring-joara.db. Leave S3 variables empty for local uploads, or configure your S3-compatible bucket credentials.

3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, when you're ready to go live.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/3.x/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Pictures, Site Images, and Virtual Artifacts

  These replace the example Media collection with the reviewed archive upload workflows. Staff can upload and organize pictures, create model thumbnails, and edit site content. Public pages use normal Payload reads with access control enforced.

## Production

Configure PAYLOAD_SECRET, a DATABASE_URL on persistent disk, and the S3 variables in .env.example. Keep the bucket private. The official S3 adapter handles staff uploads and signed model downloads. Configure bucket CORS to allow your app’s origin, GET/HEAD/PUT, upload headers (Content-Type, If-None-Match, x-amz-*), and expose ETag.

```sh
pnpm install --frozen-lockfile
# Run with production configuration after persistent storage is mounted,
# before building so prerendering can read the current schema and content:
pnpm payload migrate
pnpm build
pnpm start
```

Use a single application instance for the SQLite file. Configure database-aware backups before storing production content. Builds need access to the initialized database because public pages prerender CMS content.

Public content uses Next.js Cache Components. Partial Prefetching is explicitly disabled because speculative admin prefetches trigger time-dependent token-validation errors in the installed Payload version; this does not disable content caching or partial prerendering. Anonymous Payload reads through `cachedPayload.find`, `cachedPayload.findByID`, and `cachedPayload.findGlobal` in `src/utilities/cachedPayload.ts` are cached with the `hours` lifetime and the shared `public-content` tag. Staff changes and deletions to public collections, folders, and globals expire that tag, including pages that populate shared images. Query parameters remain request-specific; folder IDs, page numbers, and artifact IDs become cache keys. The frontend loading boundary streams these routes while their request parameters resolve.

Admin authentication and file endpoints remain request-time operations. Cached artifact documents contain stable Payload file URLs; the S3 adapter generates signed redirects when those endpoints are requested. Standalone Payload scripts have no Next.js cache to invalidate: after importing content outside the running app, rebuild the app, trigger invalidation inside the running app, or wait for time-based revalidation.

The code migration does not transfer existing production content. Transfer and validate database records, relationships, users, and media object keys separately before switching traffic. Preserve the existing Payload secret when migrating users. Do not overwrite the preserved starter database without a backup.

## Checks

```sh
pnpm generate:types
pnpm generate:importmap
pnpm payload migrate:create
pnpm lint
pnpm test:int
```

Run tests only against a separate local database and upload files; the tests create and delete fixtures. Never use production database or bucket credentials for tests.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
