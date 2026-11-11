import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Map IDs before rebuilding relationships. Reuse matching filenames in the same R2 bucket.
  await db.run(sql`PRAGMA defer_foreign_keys=ON;`)
  await db.run(sql`ALTER TABLE payload_folders ADD show_in_gallery integer DEFAULT true;`)
  await db.run(
    sql`INSERT INTO payload_folders (name, show_in_gallery) VALUES ('Website images', false);`,
  )
  await db.run(
    sql`CREATE TABLE media_picture_map (old_id integer PRIMARY KEY, new_id integer NOT NULL);`,
  )
  await db.run(sql`INSERT INTO media_picture_map SELECT m.id,
    COALESCE((SELECT p.id FROM pictures p WHERE p.filename = m.filename),
      m.id + (SELECT COALESCE(MAX(id), 0) FROM pictures)) FROM media m;`)
  await db.run(sql`INSERT INTO pictures (id, alt, _objectkey, folder_id, updated_at, created_at,
    url, thumbnail_u_r_l, filename, mime_type, filesize, width, height)
    SELECT map.new_id, m.alt, m._objectkey,
      (SELECT MAX(id) FROM payload_folders), m.updated_at, m.created_at,
      replace(m.url, '/api/media/file/', '/api/pictures/file/'),
      replace(m.thumbnail_u_r_l, '/api/media/file/', '/api/pictures/file/'),
      m.filename, m.mime_type, m.filesize, m.width, m.height
    FROM media m JOIN media_picture_map map ON map.old_id = m.id
    WHERE NOT EXISTS (SELECT 1 FROM pictures p WHERE p.id = map.new_id);`)
  await db.run(sql`PRAGMA defer_foreign_keys=ON;`)
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
  await db.run(
    sql`INSERT INTO \`__new_artifacts\`("id", "name", "description", "thumbnail_id", "_objectkey", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height") SELECT "id", "name", "description", (SELECT new_id FROM media_picture_map WHERE old_id = "thumbnail_id"), "_objectkey", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height" FROM \`artifacts\`;`,
  )
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
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "pictures_id", "artifacts_id", "payload_folders_id") SELECT "id", "order", "parent_id", "path", "users_id", COALESCE("pictures_id", (SELECT new_id FROM media_picture_map WHERE old_id = "media_id")), "artifacts_id", "payload_folders_id" FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_pictures_id_idx\` ON \`payload_locked_documents_rels\` (\`pictures_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_artifacts_id_idx\` ON \`payload_locked_documents_rels\` (\`artifacts_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_payload_folders_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_folders_id\`);`,
  )
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
  await db.run(
    sql`INSERT INTO \`__new_home\`("id", "pictures_description", "artifacts_description", "timeline_description", "museum_description", "banner_id", "banner_alt", "introduction", "updated_at", "created_at") SELECT "id", "pictures_description", "artifacts_description", "timeline_description", "museum_description", (SELECT new_id FROM media_picture_map WHERE old_id = "banner_id"), "banner_alt", "introduction", "updated_at", "created_at" FROM \`home\`;`,
  )
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`ALTER TABLE \`__new_home\` RENAME TO \`home\`;`)
  await db.run(sql`CREATE INDEX \`home_banner_idx\` ON \`home\` (\`banner_id\`);`)
  await db.run(sql`DROP TABLE media;`)
  await db.run(sql`DROP TABLE media_picture_map;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text NOT NULL,
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
  await db.run(sql`INSERT INTO media (id, alt, _objectkey, updated_at, created_at, url,
    thumbnail_u_r_l, filename, mime_type, filesize, width, height)
    SELECT id, COALESCE(alt, ''), _objectkey, updated_at, created_at,
      replace(url, '/api/pictures/file/', '/api/media/file/'),
      replace(thumbnail_u_r_l, '/api/pictures/file/', '/api/media/file/'),
      filename, mime_type, filesize, width, height FROM pictures;`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`PRAGMA defer_foreign_keys=ON;`)
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
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_artifacts\`("id", "name", "description", "thumbnail_id", "_objectkey", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height") SELECT "id", "name", "description", "thumbnail_id", "_objectkey", "updated_at", "created_at", "url", "thumbnail_u_r_l", "filename", "mime_type", "filesize", "width", "height" FROM \`artifacts\`;`,
  )
  await db.run(sql`DROP TABLE \`artifacts\`;`)
  await db.run(sql`ALTER TABLE \`__new_artifacts\` RENAME TO \`artifacts\`;`)
  await db.run(sql`CREATE INDEX \`artifacts_thumbnail_idx\` ON \`artifacts\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`artifacts_updated_at_idx\` ON \`artifacts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`artifacts_created_at_idx\` ON \`artifacts\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`artifacts_filename_idx\` ON \`artifacts\` (\`filename\`);`)
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
  	FOREIGN KEY (\`banner_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_home\`("id", "pictures_description", "artifacts_description", "timeline_description", "museum_description", "banner_id", "banner_alt", "introduction", "updated_at", "created_at") SELECT "id", "pictures_description", "artifacts_description", "timeline_description", "museum_description", "banner_id", "banner_alt", "introduction", "updated_at", "created_at" FROM \`home\`;`,
  )
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`ALTER TABLE \`__new_home\` RENAME TO \`home\`;`)
  await db.run(sql`CREATE INDEX \`home_banner_idx\` ON \`home\` (\`banner_id\`);`)
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`media_id\` integer REFERENCES media(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(sql`ALTER TABLE \`payload_folders\` DROP COLUMN \`show_in_gallery\`;`)
}
