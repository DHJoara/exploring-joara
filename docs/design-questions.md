# Design interview and implementation status

The current first-release design frontier is settled. The final clarification prioritizes standard Payload functionality and removes any requirement for a custom move feature. Application implementation is in progress; production hosting remains deferred.

## Current implementation

- Home has a fixed public layout and editable banner, introduction, and card descriptions.
- Pictures uses Payload's native folders and a separate image-upload collection. Staff create a folder, open it, and upload pictures there; alternative text is optional.
- The public Pictures page follows the same hierarchy, with stable folder-ID links, alphabetical folders, filename ordering, and an enlarged viewer with previous, next, and close controls.
- Deleting a folder removes its descendants and their pictures, including uploaded files. Independently uploaded copies in other folders remain intact.
- Public browsing is allowed; picture and folder editing require login. Saves appear on subsequent page loads without publishing or rebuilding.
- Artifacts, Timeline, and Virtual Museum remain placeholders.

## Decision tree

- Public archive and private staff editing: settled.
  - Separate publishing workflow: removed from scope by the user.
  - Successful saves, uploads, and deletions update public content without a separate publishing action.
- Separate Pictures and Artifacts pages: settled.
  - Pictures use the same nested hierarchy for staff and visitors: settled.
    - Many pictures per folder and folders within folders: explicitly reaffirmed.
    - One uploaded picture per folder membership; separately uploaded copies are independent: settled in Q9.
    - No custom moving feature; remove and reupload is sufficient: explicit final constraint.
    - Enlarged viewer with next/previous and close: accepted.
    - Automatic ordering: accepted; folders alphabetically, pictures by filename.
    - Public search: explicitly excluded for now.
    - Optional alternative text, no required picture catalog fields: accepted.
    - Delete a folder and its descendants and pictures: accepted. Independent copies in other folders remain intact.
  - Artifacts use GLB, name, description, and uploaded thumbnail: settled.
    - Require name, GLB, and thumbnail for public visibility; description optional: accepted.
    - Incomplete artifacts remain staff-only: accepted.
    - Order artifacts by name; no manual ordering or public search: accepted.
- Reference-inspired homepage, editable embedded Timeline, museum placeholder: settled.
- Payload + Next.js + PostgreSQL: current architectural direction.
  - Production hosting providers: explicitly deferred until the local workflows are demonstrated.
  - Production account ownership, backups, and service-specific upload configuration: address when choosing hosting, not blockers to confirming the local first-release scope.
- Standard functionality first, minimum custom code: explicit controlling constraint. Do not add optional conveniences as requirements.

## Final clarification: Q9

Each folder may contain many pictures and child folders. Each individual picture upload belongs to one folder; an independently uploaded copy elsewhere is a separate picture. The user accepted this ownership model and explicitly removed the need for a move feature: staff can delete and reupload instead. Use native CMS functionality and avoid custom folder or move interfaces.

There are no remaining product questions blocking documentation of the local first release. Production hosting, accounts, backups, and deployment-specific upload settings are intentionally deferred until local workflows are demonstrated.

## Recorded answers from the latest round

| Question | User decision |
| --- | --- |
| Q1: publication | Do not worry about publishing; remove that workflow from scope. |
| Q2: picture membership | Many pictures in nested folders; final clarification in Q9 confirms independent uploads. |
| Q3: picture viewer | Accept enlarged viewer with next/previous and close. |
| Q4: ordering | Accept automatic ordering; no manual ordering. |
| Q5: artifact completeness | Accept name, GLB, and thumbnail required for public visibility, optional description. |
| Q6: search | No search for now. |
| Q7: hosting | Keep production providers open. |
| Q8: alternative text | Accept optional accessibility text. |
| Q9: folder ownership and relocation | Independent copies; no custom move feature. Remove and reupload is sufficient. Prefer standard functionality throughout. |

## Repository observations from the original design interview

Historical observations before implementation:

- The project is a Payload blank starter using Payload 3.93.0, Next.js 16.4.1, and React 19.2.9.
- Payload selects the PostgreSQL adapter through `DATABASE_URL`. Users authentication, the admin interface, and REST/GraphQL routes are present.
- The generic Media upload collection allows public reads and requires an `alt` field. It has no picture-folder architecture or archive-specific schema.
- The public frontend is the starter welcome page. Pictures, Artifacts, Timeline, and Virtual Museum are not implemented.
- There is no configured external storage adapter, GLB-specific model workflow, draft/publish implementation, or recursive deletion hook.
- Package engines require Node `^22.23.4 || >=24.22.1` and pnpm `^9 || ^10 || ^11`.
- Local development needs dependencies, a reachable PostgreSQL database, `DATABASE_URL`, and `PAYLOAD_SECRET`, then `pnpm dev`.
- README, `.env.example`, and Compose retain MongoDB starter instructions despite the PostgreSQL application config. Do not follow those MongoDB instructions as the intended project setup.
- The earlier local environment check found Docker installed but its daemon unreachable. This documentation session did not start services, verify connectivity, read secret values, or change runtime configuration.

## Documentation map

- [Domain glossary](../CONTEXT.md): agreed vocabulary only.
- [Requirements](requirements.md): desired behavior and confirmed scope.
- [Architecture decision](adr/0001-payload-nextjs-postgres.md): why the stack differs from the original proposal.
- This document: unresolved choices and verified implementation status.
