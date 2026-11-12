import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`site_images\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`_objectkey\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`site_images_updated_at_idx\` ON \`site_images\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`site_images_created_at_idx\` ON \`site_images\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`site_images_filename_idx\` ON \`site_images\` (\`filename\`);`)

  // Preserve IDs so existing Home and artifact relationships remain valid.
  // Include root uploads and hidden folders, which previously held website assets.
  await db.run(sql`INSERT INTO site_images (id, alt, _objectkey, updated_at, created_at, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height)
    SELECT p.id, p.alt, p._objectkey, p.updated_at, p.created_at, replace(p.url, '/api/pictures/file/', '/api/site_images/file/'), replace(p.thumbnail_u_r_l, '/api/pictures/file/', '/api/site_images/file/'), p.filename, p.mime_type, p.filesize, p.width, p.height FROM pictures p
    WHERE p.folder_id IS NULL
      OR p.folder_id IN (SELECT id FROM payload_folders WHERE show_in_gallery = 0)
      OR p.id IN (SELECT thumbnail_id FROM artifacts)
      OR p.id IN (
        SELECT banner_id FROM home UNION SELECT pictures_image_id FROM home
        UNION SELECT artifacts_image_id FROM home UNION SELECT timeline_image_id FROM home
        UNION SELECT museum_image_id FROM home
      );`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_artifacts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`thumbnail_id\` integer NOT NULL,
  	\`_objectkey\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_artifacts\`("id", "name", "description", "thumbnail_id", "_objectkey", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height") SELECT "id", "name", "description", "thumbnail_id", "_objectkey", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height" FROM \`artifacts\`;`)
  await db.run(sql`DROP TABLE \`artifacts\`;`)
  await db.run(sql`ALTER TABLE \`__new_artifacts\` RENAME TO \`artifacts\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`artifacts_thumbnail_idx\` ON \`artifacts\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`artifacts_updated_at_idx\` ON \`artifacts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`artifacts_created_at_idx\` ON \`artifacts\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`artifacts_filename_idx\` ON \`artifacts\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`__new_home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`pictures_image_id\` integer,
  	\`pictures_description\` text DEFAULT 'Explore photographs of the site, the landscape, and the work of archaeology.' NOT NULL,
  	\`artifacts_image_id\` integer,
  	\`artifacts_description\` text DEFAULT 'View the objects uncovered at Joara and explore them in three dimensions.' NOT NULL,
  	\`timeline_image_id\` integer,
  	\`timeline_description\` text DEFAULT 'Follow the history of Joara and the surrounding region through time.' NOT NULL,
  	\`museum_image_id\` integer,
  	\`museum_description\` text DEFAULT 'A new way to experience the story of Joara. Coming soon.' NOT NULL,
  	\`banner_id\` integer,
  	\`banner_alt\` text,
  	\`introduction\` text DEFAULT 'Explore the archaeology, environment, and enduring legacy of Joara, an ancient town in present-day western North Carolina, through pictures, artifacts, and stories of the past.' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`pictures_image_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`artifacts_image_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`timeline_image_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`museum_image_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`banner_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home\`("id", "pictures_image_id", "pictures_description", "artifacts_image_id", "artifacts_description", "timeline_image_id", "timeline_description", "museum_image_id", "museum_description", "banner_id", "banner_alt", "introduction", "updated_at", "created_at") SELECT "id", "pictures_image_id", "pictures_description", "artifacts_image_id", "artifacts_description", "timeline_image_id", "timeline_description", "museum_image_id", "museum_description", "banner_id", "banner_alt", "introduction", "updated_at", "created_at" FROM \`home\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`ALTER TABLE \`__new_home\` RENAME TO \`home\`;`)
  await db.run(sql`CREATE INDEX \`home_pictures_pictures_image_idx\` ON \`home\` (\`pictures_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_artifacts_artifacts_image_idx\` ON \`home\` (\`artifacts_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_timeline_timeline_image_idx\` ON \`home\` (\`timeline_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_museum_museum_image_idx\` ON \`home\` (\`museum_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_banner_idx\` ON \`home\` (\`banner_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`site_images_id\` integer REFERENCES site_images(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_site_images_id_idx\` ON \`payload_locked_documents_rels\` (\`site_images_id\`);`)
  await db.run(sql`DELETE FROM pictures WHERE id IN (SELECT id FROM site_images)
    AND (folder_id IS NULL OR folder_id IN
      (SELECT id FROM payload_folders WHERE show_in_gallery = 0));`)

}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  // Map back by filename and allocate fresh IDs for images created after the split.
  await db.run(sql`CREATE TEMP TABLE site_image_map AS SELECT s.id AS old_id,
    COALESCE((SELECT p.id FROM pictures p WHERE p.filename = s.filename),
      s.id + (SELECT COALESCE(MAX(id), 0) FROM pictures)) AS new_id FROM site_images s;`)
  await db.run(sql`INSERT INTO pictures (id, alt, _objectkey, updated_at, created_at, url, thumbnail_u_r_l, filename, mime_type, filesize, width, height)
    SELECT m.new_id, s.alt, s._objectkey, s.updated_at, s.created_at,
      replace(s.url, '/api/site_images/file/', '/api/pictures/file/'),
      replace(s.thumbnail_u_r_l, '/api/site_images/file/', '/api/pictures/file/'),
      s.filename, s.mime_type, s.filesize, s.width, s.height
    FROM site_images s JOIN site_image_map m ON m.old_id = s.id
    WHERE NOT EXISTS (SELECT 1 FROM pictures p WHERE p.id = m.new_id);`)
  await db.run(sql`UPDATE artifacts SET thumbnail_id =
    (SELECT new_id FROM site_image_map WHERE old_id = artifacts.thumbnail_id);`)

  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_artifacts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`thumbnail_id\` integer NOT NULL,
  	\`_objectkey\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`pictures\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_artifacts\`("id", "name", "description", "thumbnail_id", "_objectkey", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height") SELECT "id", "name", "description", "thumbnail_id", "_objectkey", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height" FROM \`artifacts\`;`)
  await db.run(sql`DROP TABLE \`artifacts\`;`)
  await db.run(sql`ALTER TABLE \`__new_artifacts\` RENAME TO \`artifacts\`;`)
  await db.run(sql`CREATE INDEX \`artifacts_thumbnail_idx\` ON \`artifacts\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`artifacts_updated_at_idx\` ON \`artifacts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`artifacts_created_at_idx\` ON \`artifacts\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`artifacts_filename_idx\` ON \`artifacts\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`pictures_id\` integer,
  	\`artifacts_id\` integer,
  	\`payload_folders_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pictures_id\`) REFERENCES \`pictures\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`artifacts_id\`) REFERENCES \`artifacts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_folders_id\`) REFERENCES \`payload_folders\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "pictures_id", "artifacts_id", "payload_folders_id") SELECT "id", "order", "parent_id", "path", "users_id", "pictures_id", "artifacts_id", "payload_folders_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pictures_id_idx\` ON \`payload_locked_documents_rels\` (\`pictures_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_artifacts_id_idx\` ON \`payload_locked_documents_rels\` (\`artifacts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_payload_folders_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_folders_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`pictures_image_id\` integer,
  	\`pictures_description\` text DEFAULT 'Explore photographs of the site, the landscape, and the work of archaeology.' NOT NULL,
  	\`artifacts_image_id\` integer,
  	\`artifacts_description\` text DEFAULT 'View the objects uncovered at Joara and explore them in three dimensions.' NOT NULL,
  	\`timeline_image_id\` integer,
  	\`timeline_description\` text DEFAULT 'Follow the history of Joara and the surrounding region through time.' NOT NULL,
  	\`museum_image_id\` integer,
  	\`museum_description\` text DEFAULT 'A new way to experience the story of Joara. Coming soon.' NOT NULL,
  	\`banner_id\` integer,
  	\`banner_alt\` text,
  	\`introduction\` text DEFAULT 'Explore the archaeology, environment, and enduring legacy of Joara, an ancient town in present-day western North Carolina, through pictures, artifacts, and stories of the past.' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`pictures_image_id\`) REFERENCES \`pictures\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`artifacts_image_id\`) REFERENCES \`pictures\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`timeline_image_id\`) REFERENCES \`pictures\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`museum_image_id\`) REFERENCES \`pictures\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`banner_id\`) REFERENCES \`pictures\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`INSERT INTO \`__new_home\`("id", "pictures_image_id", "pictures_description", "artifacts_image_id", "artifacts_description", "timeline_image_id", "timeline_description", "museum_image_id", "museum_description", "banner_id", "banner_alt", "introduction", "updated_at", "created_at") SELECT "id", "pictures_image_id", "pictures_description", "artifacts_image_id", "artifacts_description", "timeline_image_id", "timeline_description", "museum_image_id", "museum_description", "banner_id", "banner_alt", "introduction", "updated_at", "created_at" FROM \`home\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`ALTER TABLE \`__new_home\` RENAME TO \`home\`;`)
  await db.run(sql`CREATE INDEX \`home_pictures_pictures_image_idx\` ON \`home\` (\`pictures_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_artifacts_artifacts_image_idx\` ON \`home\` (\`artifacts_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_timeline_timeline_image_idx\` ON \`home\` (\`timeline_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_museum_museum_image_idx\` ON \`home\` (\`museum_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_banner_idx\` ON \`home\` (\`banner_id\`);`)

  await db.run(sql`UPDATE home SET
    banner_id = (SELECT new_id FROM site_image_map WHERE old_id = home.banner_id),
    pictures_image_id = (SELECT new_id FROM site_image_map WHERE old_id = home.pictures_image_id),
    artifacts_image_id = (SELECT new_id FROM site_image_map WHERE old_id = home.artifacts_image_id),
    timeline_image_id = (SELECT new_id FROM site_image_map WHERE old_id = home.timeline_image_id),
    museum_image_id = (SELECT new_id FROM site_image_map WHERE old_id = home.museum_image_id);`)
  await db.run(sql`DROP TABLE site_images;`)
  await db.run(sql`DROP TABLE site_image_map;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
}
