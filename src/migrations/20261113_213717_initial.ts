import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`pictures\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`prefix\` text DEFAULT '',
  	\`_objectkey\` text,
  	\`folder_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	FOREIGN KEY (\`folder_id\`) REFERENCES \`payload_folders\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pictures_folder_idx\` ON \`pictures\` (\`folder_id\`);`)
  await db.run(sql`CREATE INDEX \`pictures_updated_at_idx\` ON \`pictures\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pictures_created_at_idx\` ON \`pictures\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pictures_filename_idx\` ON \`pictures\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`virtual_artifacts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`thumbnail_id\` integer NOT NULL,
  	\`prefix\` text DEFAULT '',
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
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`virtual_artifacts_thumbnail_idx\` ON \`virtual_artifacts\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`virtual_artifacts_updated_at_idx\` ON \`virtual_artifacts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`virtual_artifacts_created_at_idx\` ON \`virtual_artifacts\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`virtual_artifacts_filename_idx\` ON \`virtual_artifacts\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`site_images\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`prefix\` text DEFAULT '',
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
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_folders_folder_type\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_folders\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_folders_folder_type_order_idx\` ON \`payload_folders_folder_type\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_folders_folder_type_parent_idx\` ON \`payload_folders_folder_type\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_folders\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`folder_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`folder_id\`) REFERENCES \`payload_folders\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_folders_name_idx\` ON \`payload_folders\` (\`name\`);`)
  await db.run(sql`CREATE INDEX \`payload_folders_folder_idx\` ON \`payload_folders\` (\`folder_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_folders_updated_at_idx\` ON \`payload_folders\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_folders_created_at_idx\` ON \`payload_folders\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`pictures_id\` integer,
  	\`virtual_artifacts_id\` integer,
  	\`site_images_id\` integer,
  	\`payload_folders_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pictures_id\`) REFERENCES \`pictures\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`virtual_artifacts_id\`) REFERENCES \`virtual_artifacts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`site_images_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_folders_id\`) REFERENCES \`payload_folders\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pictures_id_idx\` ON \`payload_locked_documents_rels\` (\`pictures_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_virtual_artifacts_id_idx\` ON \`payload_locked_documents_rels\` (\`virtual_artifacts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_site_images_id_idx\` ON \`payload_locked_documents_rels\` (\`site_images_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_payload_folders_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_folders_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`pictures_image_id\` integer,
  	\`pictures_description\` text DEFAULT 'Explore photographs of the site, the landscape, and the work of archaeology.' NOT NULL,
  	\`virtual_artifacts_image_id\` integer,
  	\`virtual_artifacts_description\` text DEFAULT 'View the objects uncovered at Joara and explore them in three dimensions.' NOT NULL,
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
  	FOREIGN KEY (\`virtual_artifacts_image_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`timeline_image_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`museum_image_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`banner_id\`) REFERENCES \`site_images\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_pictures_pictures_image_idx\` ON \`home\` (\`pictures_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_virtual_artifacts_virtual_artifacts_image_idx\` ON \`home\` (\`virtual_artifacts_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_timeline_timeline_image_idx\` ON \`home\` (\`timeline_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_museum_museum_image_idx\` ON \`home\` (\`museum_image_id\`);`)
  await db.run(sql`CREATE INDEX \`home_banner_idx\` ON \`home\` (\`banner_id\`);`)
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
  	\`blurb\` text DEFAULT 'For decades, Joara’s artifacts have only been accessible to the public through in-person traveling exhibitions and physical displays. But through 3D rendering, you can examine artifacts from every angle, viewing them through the eyes of a field archaeologist. This collection of 3D-rendered objects provides you with the ability to turn each artifact, examine every scar, and zoom into five centuries of unearthed history. Alongside these models, facts are displayed: the location found, our understanding of the purpose of the tools, and who might have used them in everyday life.' NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`timeline\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`blurb\` text DEFAULT 'This timeline was created in order to share the forty year story of archeological work through photos, people, and excavation history. We wanted to highlight the people and process of the Berry site rather than just the history that’s been uncovered itself. We hope that people will see this and appreciate the work that goes into the discoveries being made at this site.' NOT NULL,
  	\`embed_u_r_l\` text DEFAULT 'https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=v2%3A2PACX-1vSKiUKTaRGE3UzpI6o-YbxWaWLaxVHug92nsgxVcnjVy6hov6WwdIS55KN6QYh-3Gs3WFJNirWY-lIk&font=Default&lang=en&initial_zoom=2&width=100%25&height=650' NOT NULL,
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
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`pictures\`;`)
  await db.run(sql`DROP TABLE \`virtual_artifacts\`;`)
  await db.run(sql`DROP TABLE \`site_images\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_folders_folder_type\`;`)
  await db.run(sql`DROP TABLE \`payload_folders\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`DROP TABLE \`pictures_page\`;`)
  await db.run(sql`DROP TABLE \`virtual_artifacts_page\`;`)
  await db.run(sql`DROP TABLE \`timeline\`;`)
  await db.run(sql`DROP TABLE \`virtual_museum\`;`)
}
