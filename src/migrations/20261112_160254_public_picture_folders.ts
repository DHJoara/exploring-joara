import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`virtual_artifacts\` ADD \`focal_x\` numeric;`)
  await db.run(sql`ALTER TABLE \`virtual_artifacts\` ADD \`focal_y\` numeric;`)
  await db.run(sql`ALTER TABLE \`payload_folders\` DROP COLUMN \`show_in_gallery\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`payload_folders\` ADD \`show_in_gallery\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`virtual_artifacts\` DROP COLUMN \`focal_x\`;`)
  await db.run(sql`ALTER TABLE \`virtual_artifacts\` DROP COLUMN \`focal_y\`;`)
}
