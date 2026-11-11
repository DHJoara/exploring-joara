---
status: accepted
---

# Keep the website and CMS in one Payload and Next.js application

The project moved from an Omeka S backend with a separate Astro frontend toward Payload and Next.js together, using PostgreSQL. The clarified scope emphasizes simple staff editing, nested site pictures, and GLB artifacts rather than a specialized museum catalog; one application avoids maintaining an independent frontend and a custom Omeka folder interface.

The existing project already selects Payload's PostgreSQL adapter. This records the current architectural direction, not completion of the archive or approval of a production hosting provider. Payload supplies the staff interface and content infrastructure; custom Next.js pages supply the public design. Recursive folder deletion still needs implementation; the user has removed a separate publishing workflow from scope.
