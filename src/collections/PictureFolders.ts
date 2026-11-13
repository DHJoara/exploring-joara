import type { Config } from 'payload'

// Extend the native folder collection; keep its validation and nested-folder handling.
export const pictureFolders: Exclude<Config['folders'], false | undefined> = {
  collectionOverrides: [
    ({ collection }) => ({
      ...collection,
      access: { ...collection.access, read: () => true },
      hooks: {
        ...collection.hooks,
        beforeDelete: [
          async (args) => {
            const { id, req } = args
            const result = await req.payload.delete({
              collection: 'pictures',
              where: { folder: { equals: id } },
              req,
            })
            if (result.errors.length)
              throw new Error('Could not delete all pictures in this folder.')

            for (const hook of collection.hooks?.beforeDelete ?? []) await hook(args)

            // Native bulk deletion reports child failures instead of throwing them.
            const remaining = await req.payload.count({
              collection: 'payload-folders',
              where: { folder: { equals: id } },
              req,
            })
            if (remaining.totalDocs) throw new Error('Could not delete all subfolders.')
          },
        ],
      },
    }),
  ],
}
