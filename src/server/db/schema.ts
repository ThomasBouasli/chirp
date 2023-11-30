import { relations } from "drizzle-orm";
import {
  mysqlTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const mysqlTable = mysqlTableCreator((name) => `chirp_${name}`);

export const posts = mysqlTable("post", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  parent_id: varchar("parent_id", { length: 255 }),
  author_id: varchar("author_id", { length: 255 }).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").notNull(),
});

export const postRelations = relations(posts, ({ many, one }) => ({
  children: many(posts, { relationName: 'subPosts' }),
  parent: one(posts, { fields: [posts.parent_id], references: [posts.id], relationName: "subPosts" }),
}));
