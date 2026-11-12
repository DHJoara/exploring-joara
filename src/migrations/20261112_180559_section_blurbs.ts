import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pictures_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`blurb\` text DEFAULT 'The Joara Photo Archive showcases photos, posters, and outreach events since 1985. Our collection features photos from our Field Days, Artifacts, Informational panels, and even photos from our Berry site. Explore our hand-picked selection of photos that opens a new world.
  
  To begin traversing, click on a folder to begin exploring each of our events. Each folder contains organized photographs in chronological order. You can examine digital artifacts, inspect what tools they used in the berry site digging, and even investigate how the digital archive was made.' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`virtual_artifacts_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`blurb\` text DEFAULT 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`virtual_museum\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`blurb\` text DEFAULT 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`ALTER TABLE \`timeline\` ADD \`blurb\` text DEFAULT 'This timeline was created in order to share the forty year story of archeological work through photos, people, and excavation history. We wanted to highlight the people and process of the Berry site rather than just the history that’s been uncovered itself. We hope that people will see this and appreciate the work that goes into the discoveries being made at this site.' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pictures_page\`;`)
  await db.run(sql`DROP TABLE \`virtual_artifacts_page\`;`)
  await db.run(sql`DROP TABLE \`virtual_museum\`;`)
  await db.run(sql`ALTER TABLE \`timeline\` DROP COLUMN \`blurb\`;`)
}
