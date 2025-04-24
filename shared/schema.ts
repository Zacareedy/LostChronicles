import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  progressData: jsonb("progress_data"),
  lastLogin: timestamp("last_login"),
});

export const stations = pgTable("stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  coordinates: text("coordinates"),
  discoveredBy: integer("discovered_by").references(() => users.id),
  isHidden: boolean("is_hidden").default(true).notNull(),
});

export const terminalLogs = pgTable("terminal_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  command: text("command").notNull(),
  response: text("response"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const audioLogs = pgTable("audio_logs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isLocked: boolean("is_locked").default(true).notNull(),
  unlockedBy: integer("unlocked_by").references(() => users.id),
});

export const incidentReports = pgTable("incident_reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  classification: text("classification").default("CLASSIFIED"),
  isHidden: boolean("is_hidden").default(true).notNull(),
});

export const progressData = pgTable("progress_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  stationsDiscovered: jsonb("stations_discovered"),
  puzzlesSolved: jsonb("puzzles_solved"),
  logsUnlocked: jsonb("logs_unlocked"),
  lastCountdownReset: timestamp("last_countdown_reset"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStationSchema = createInsertSchema(stations).pick({
  name: true,
  code: true,
  description: true,
  coordinates: true,
});

export const insertTerminalLogSchema = createInsertSchema(terminalLogs).pick({
  userId: true,
  command: true,
  response: true,
});

export const insertAudioLogSchema = createInsertSchema(audioLogs).pick({
  title: true,
  description: true,
});

export const insertIncidentReportSchema = createInsertSchema(incidentReports).pick({
  title: true,
  content: true,
  classification: true,
});

export const insertProgressDataSchema = createInsertSchema(progressData).pick({
  userId: true,
  stationsDiscovered: true,
  puzzlesSolved: true,
  logsUnlocked: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Station = typeof stations.$inferSelect;
export type InsertStation = z.infer<typeof insertStationSchema>;

export type TerminalLog = typeof terminalLogs.$inferSelect;
export type InsertTerminalLog = z.infer<typeof insertTerminalLogSchema>;

export type AudioLog = typeof audioLogs.$inferSelect;
export type InsertAudioLog = z.infer<typeof insertAudioLogSchema>;

export type IncidentReport = typeof incidentReports.$inferSelect;
export type InsertIncidentReport = z.infer<typeof insertIncidentReportSchema>;

export type ProgressData = typeof progressData.$inferSelect;
export type InsertProgressData = z.infer<typeof insertProgressDataSchema>;
