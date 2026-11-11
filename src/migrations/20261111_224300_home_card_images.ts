import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`home\` ADD \`pictures_image_id\` integer REFERENCES pictures(id);`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`artifacts_image_id\` integer REFERENCES pictures(id);`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`timeline_image_id\` integer REFERENCES pictures(id);`)
  await db.run(sql`ALTER TABLE \`home\` ADD \`museum_image_id\` integer REFERENCES pictures(id);`)
  await db.run(sql`CREATE INDEX \`home_pictures_pictures_image_idx\` ON \`home\` (\`pictures_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_artifacts_artifacts_image_idx\` ON \`home\` (\`artifacts_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_timeline_timeline_image_idx\` ON \`home\` (\`timeline_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_museum_museum_image_idx\` ON \`home\` (\`museum_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`pictures_description\` text DEFAULT 'Explore photographs of the site, the landscape, and the work of archaeology.' NOT NULL,
  	\`artifacts_description\` text DEFAULT 'View the objects uncovered at Joara and explore them in three dimensions.' NOT NULL,
  	\`timeline_description\` text DEFAULT 'Follow the history of Joara and the surrounding region through time.' NOT NULL,
  	\`museum_description\` text DEFAULT 'A new way to experience the story of Joara. Coming soon.' NOT NULL,
  	\`banner_id\` integer,
  	\`banner_alt\` text,
  	\`introduction\` text DEFAULT 'Explore the archaeology, environment, and enduring legacy of Joara, an ancient town in present-day western North Carolina, through pictures, artifacts, and stories of the past.' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`banner_id\`) REFERENCES \`pictures\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home\`("id", "pictures_description", "artifacts_description", "timeline_description", "museum_description", "banner_id", "banner_alt", "introduction", "updated_at", "created_at") SELECT "id", "pictures_description", "artifacts_description", "timeline_description", "museum_description", "banner_id", "banner_alt", "introduction", "updated_at", "created_at" FROM \`home\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`ALTER TABLE \`__new_home\` RENAME TO \`home\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`home_banner_idx\` ON \`home\` (\`banner_id\`);`)
}
