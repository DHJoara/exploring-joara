# Exploring Joara requirements

Status: first-release scope captured from the design interview, including the final instruction to prioritize standard Payload functionality and minimal custom code. Production hosting is intentionally deferred. Documentation does not itself authorize application implementation or deployment.

## Purpose and users

Build a public archive that Joara archaeologists can maintain without editing code. Visitors can browse without logging in. Staff sign in to manage content and organize pictures. Keep the existing CMS administration interface wherever practical; avoid developing a bespoke file explorer or page builder.

## Simplicity constraint

Use standard Payload administration, upload, folder, validation, and access-control functionality wherever possible. Configure existing capabilities before writing custom code. The public pages still need application code to match the reference, but do not build replacement CMS screens, a bespoke file explorer, a custom move operation, shared-picture linking, a page builder, or additional workflow infrastructure.

Staff can remove a picture and reupload it into another folder. No move feature is required. Existing native CMS controls may remain available without customization; their presence does not create a requirement to extend or replicate them on the public website. Each uploaded picture belongs to one folder, and separately uploaded copies are independent.

Recursive folder deletion remains a requested behavior. Verify the installed Payload version's native behavior first; add only the smallest necessary handling if it cannot meet that behavior. This requirement is not permission to create a broader custom folder system.

## Confirmed first-release scope

| Page | Visitor experience | Staff-editable content |
| --- | --- | --- |
| Home | Landscape banner, short introduction, four destination cards, persistent sidebar | Banner and introduction |
| Pictures | Dedicated picture archive following the staff-managed nested folder hierarchy | Folders, subfolders, and uploaded pictures |
| Artifacts | Separate, flat artifact collection and individual interactive artifact views | Name, description, GLB scan, uploaded thumbnail |
| Timeline | Embedded external timeline | Embed address |
| Virtual museum | Coming-soon placeholder | Placeholder text |

Pictures and Artifacts are entirely separate public pages. Artifact records do not use the picture folder architecture. No Exhibits, Maps, or arbitrary page creation is required for the first release.

## Visual direction

Use the reference image supplied in the conversation: restrained archive presentation, pale neutral surfaces, serif typography, a left sidebar, a wide landscape banner, and image-led destination cards. Ignore its orange exterior background. The four destinations are Pictures, Artifacts, Timeline, and Virtual Museum; do not copy the reference's original navigation labels as requirements.

Staff edit content within a developer-controlled layout. They do not need layout rearrangement, visual page building, or code access. Mobile and keyboard behavior must be usable; exact responsive styling is an implementation detail to resolve during design.

## Pictures and folders

- Support folders within folders, with no product-imposed fixed depth.
- Staff can upload pictures and maintain folder names and hierarchy through the CMS.
- The public hierarchy matches the staff-maintained picture hierarchy.
- Folder names and hierarchy define public organization. There is no separate publication gate in the first-release scope. Picture relocation uses remove-and-reupload; do not build a move feature.
- Folder renames should preserve stable links to existing records. A removed picture and its reuploaded replacement are different records; preserving the old picture URL is not required.
- Deleting a picture folder removes its descendant folders and contained pictures. Empty-folder-only deletion was explicitly rejected.
- Pictures have no required editorial metadata fields. Staff may optionally enter alternative text for accessibility; a title, caption, or description is not required. Internal file properties must not become a mandatory cataloging workflow.
- A familiar, maintainable interface is the priority. A custom drag-and-drop explorer is not required.
- Clicking a picture opens an enlarged viewer with next/previous controls for the current folder and a close control.
- Sort folders alphabetically and pictures by filename. Manual ordering is outside the first release.
- There is no public search in the first release.

A picture belongs to one folder. Uploading the same file into another folder creates an independent picture copy; deleting one folder does not delete copies in other folders.

## Artifacts

- An artifact has a name, description, GLB scan, and separately uploaded real-life photo thumbnail.
- Visitors can rotate and zoom the interactive scan.
- Do not require artifact dates, materials, catalog numbers, discovery locations, or other museum metadata in the first release.
- Automatic thumbnail generation and a custom screenshot-capture interface are outside the agreed first release.
- Require a name, GLB, and photo thumbnail when saving an artifact. Description may be empty. A successful save makes it public; incomplete entries cannot be saved.
- Sort artifacts by name; no manual ordering or public search is required.

## Staff editing and public updates

- Editing requires login; public browsing does not.
- The user explicitly removed the separate publish workflow from scope. Do not implement a Publish Website button, approval step, or archive-wide draft snapshot.
- Successful saves, uploads, and deletions update the public archive without a separate publishing action. Do not introduce site-wide draft snapshots or publishing infrastructure.
- Staff must not need command-line, GitHub, or infrastructure access for routine content updates.
- Artifact saves require the scan and thumbnail; no incomplete-entry or draft workflow is needed.
- Cache handling must make successful changes visible without a manual deployment; exact invalidation mechanics remain implementation details.
- No production rebuild webhook or Cloudflare Worker is mandated by the revised architecture. Those belonged to the original Omeka/Astro proposal.

## Technical direction

Use Payload and Next.js together in one application, with PostgreSQL. See [ADR 0001](adr/0001-payload-nextjs-postgres.md).

Production hosting providers remain intentionally undecided until the local nested-folder and large-GLB workflows have been demonstrated. Vercel, managed PostgreSQL, and Cloudflare R2 were discussed as options, not commitments. Google's model-viewer component is the recommended GLB viewer. Production account ownership and backup policy will be addressed when selecting hosting. The final implementation must be validated against the project's installed versions rather than copied from potentially newer documentation.

## Completion scenarios

1. A visitor opens the homepage without signing in and can navigate to all four sections.
2. An editor creates a folder and subfolder and uploads site pictures without entering descriptive catalog fields.
3. The visitor sees the same picture hierarchy without requiring a separate publication action.
4. An editor renames a folder; public organization updates while existing record links remain valid. To relocate a picture, staff remove it and reupload it in the destination folder.
5. An editor deletes a populated folder; its complete subtree and contained pictures are removed. Separately uploaded copies in other folders remain intact.
6. An editor uploads an artifact scan and thumbnail and enters its name and optional description. A visitor can open and manipulate the saved artifact; incomplete entries cannot be saved.
7. Staff change the homepage banner, timeline address, or museum text without developer assistance.
8. Anonymous users cannot create, change, or delete archive content.
9. A failed upload or editing action reports failure rather than falsely reporting success.
10. Pictures support optional accessibility text, enlarged viewing, and automatic ordering without requiring descriptive catalog fields.

## Implementation boundary

The archive-specific pages, content types, folder behavior, and GLB viewer are requirements, not claims of completed functionality. Current-code findings are maintained separately in [Design questions](design-questions.md). No production deployment is authorized by this document.
