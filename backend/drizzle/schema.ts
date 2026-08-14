import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

export const clinics = mysqlTable("clinics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: text("logo"),
  ownerName: varchar("ownerName", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  workingHours: text("workingHours"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull().default(1),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["owner", "admin", "doctor", "receptionist", "user"]).default("admin").notNull(),
  isOwner: boolean("isOwner").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const packages = mysqlTable("packages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  priceMonthly: decimal("priceMonthly", { precision: 10, scale: 2 }).notNull(),
  maxAgents: int("maxAgents").notNull().default(2),
  features: text("features"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const clinicSubscriptions = mysqlTable("clinicSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  packageId: int("packageId").notNull(),
  status: mysqlEnum("status", ["active", "trial", "expired", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const subscriptionInvoices = mysqlTable("subscriptionInvoices", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  subscriptionId: int("subscriptionId").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["paid", "pending", "failed"]).default("paid").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }).default("Bot"),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const clinicAgents = mysqlTable("clinicAgents", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  agentId: int("agentId").notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  enabledAt: timestamp("enabledAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agentUsageLogs = mysqlTable("agentUsageLogs", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  agentId: int("agentId").notNull(),
  userId: int("userId"),
  promptTokens: int("promptTokens").default(0).notNull(),
  completionTokens: int("completionTokens").default(0).notNull(),
  cost: decimal("cost", { precision: 8, scale: 4 }).default("0.0000").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const treatments = mysqlTable("treatments", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  defaultCost: decimal("defaultCost", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: int("durationMinutes").default(30).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  dateOfBirth: varchar("dateOfBirth", { length: 20 }),
  gender: varchar("gender", { length: 20 }),
  status: mysqlEnum("status", ["active", "cleared", "uncleared"]).default("uncleared").notNull(),
  toothChart: text("toothChart"), // JSON string of teeth states
  allergies: text("allergies"),
  medicalConditions: text("medicalConditions"),
  attachments: text("attachments"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const installmentPlans = mysqlTable("installmentPlans", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  treatmentId: int("treatmentId"),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("downPayment", { precision: 10, scale: 2 }).default("0.00").notNull(),
  installmentCount: int("installmentCount").notNull().default(3),
  frequency: varchar("frequency", { length: 30 }).default("monthly").notNull(),
  status: mysqlEnum("status", ["active", "completed", "defaulted"]).default("active").notNull(),
  remainingAmount: decimal("remainingAmount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const installments = mysqlTable("installments", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  installmentPlanId: int("installmentPlanId").notNull(),
  installmentNumber: int("installmentNumber").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  doctorId: int("doctorId"),
  treatmentId: int("treatmentId"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  status: mysqlEnum("status", ["scheduled", "confirmed", "completed", "cancelled"]).default("scheduled").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  patientId: int("patientId").notNull(),
  appointmentId: int("appointmentId"),
  installmentId: int("installmentId"),
  type: mysqlEnum("type", ["appointment", "payment_due", "overdue"]).notNull(),
  channel: mysqlEnum("channel", ["whatsapp", "sms", "email"]).default("whatsapp").notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = typeof clinics.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Package = typeof packages.$inferSelect;
export type ClinicSubscription = typeof clinicSubscriptions.$inferSelect;
export type SubscriptionInvoice = typeof subscriptionInvoices.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type ClinicAgent = typeof clinicAgents.$inferSelect;
export type AgentUsageLog = typeof agentUsageLogs.$inferSelect;
export type Treatment = typeof treatments.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type InstallmentPlan = typeof installmentPlans.$inferSelect;
export type Installment = typeof installments.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
