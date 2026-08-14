import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { 
  clinics, users, packages, clinicSubscriptions, subscriptionInvoices, 
  agents, clinicAgents, agentUsageLogs, treatments, patients, 
  installmentPlans, installments, appointments, reminders, activityLogs 
} from "../drizzle/schema";
import { eq, and, sql, desc, asc, sum, count, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async opts => {
      const db = await getDb();
      if (!db || !opts.ctx.user) return opts.ctx.user ?? null;
      const [dbUser] = await db.select().from(users).where(eq(users.openId, opts.ctx.user.openId)).limit(1);
      if (dbUser) {
        return {
          ...opts.ctx.user,
          clinicId: dbUser.clinicId,
          role: dbUser.role,
          isOwner: dbUser.isOwner,
        };
      }
      return opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  clinic: router({
    getSettings: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const clinicId = ctx.user.clinicId || 1;
      const [clinic] = await db.select().from(clinics).where(eq(clinics.id, clinicId)).limit(1);
      if (!clinic) {
        await db.insert(clinics).values({
          id: clinicId,
          name: "DentalPay Premier Care",
          ownerName: "Dr. Alex Morgan",
          phone: "+1 (555) 234-5678",
          address: "100 Healthcare Ave, Suite 400, Boston, MA",
          workingHours: "Mon-Fri: 8:00 AM - 6:00 PM",
        });
        const [newClinic] = await db.select().from(clinics).where(eq(clinics.id, clinicId)).limit(1);
        return newClinic;
      }
      return clinic;
    }),
  }),

  billing: router({
    getPackages: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      const pkgs = await db.select().from(packages);
      if (pkgs.length === 0) {
        await db.insert(packages).values([
          { name: "Starter", description: "Essential practice management for solo dentists", priceMonthly: "49.00", maxAgents: 1, features: JSON.stringify(["Patient Records", "Tooth Chart", "Installment Tracking", "1 AI Agent"]) },
          { name: "Professional", description: "Full multi-doctor clinic suite with advanced analytics", priceMonthly: "129.00", maxAgents: 3, features: JSON.stringify(["Everything in Starter", "Appointment Scheduling", "WhatsApp Reminders", "3 AI Agents", "Financial Growth Reports"]) },
          { name: "Enterprise", description: "Unlimited AI agents & priority 24/7 support", priceMonthly: "299.00", maxAgents: 10, features: JSON.stringify(["Everything in Professional", "Unlimited AI Agents", "Multi-Location Support", "Custom API Access", "Dedicated Account Manager"]) },
        ]);
        return await db.select().from(packages);
      }
      return pkgs;
    }),
    getCurrentSubscription: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const clinicId = ctx.user.clinicId || 1;
      const subs = await db.select({
        id: clinicSubscriptions.id,
        clinicId: clinicSubscriptions.clinicId,
        packageId: clinicSubscriptions.packageId,
        status: clinicSubscriptions.status,
        startDate: clinicSubscriptions.startDate,
        endDate: clinicSubscriptions.endDate,
        packageName: packages.name,
        priceMonthly: packages.priceMonthly,
        maxAgents: packages.maxAgents,
      }).from(clinicSubscriptions)
        .leftJoin(packages, eq(clinicSubscriptions.packageId, packages.id))
        .where(eq(clinicSubscriptions.clinicId, clinicId))
        .orderBy(desc(clinicSubscriptions.id))
        .limit(1);

      if (subs.length === 0) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        await db.insert(clinicSubscriptions).values({
          clinicId,
          packageId: 2,
          status: "active",
          startDate: new Date(),
          endDate,
        });
        const [newSub] = await db.select({
          id: clinicSubscriptions.id,
          clinicId: clinicSubscriptions.clinicId,
          packageId: clinicSubscriptions.packageId,
          status: clinicSubscriptions.status,
          startDate: clinicSubscriptions.startDate,
          endDate: clinicSubscriptions.endDate,
          packageName: packages.name,
          priceMonthly: packages.priceMonthly,
          maxAgents: packages.maxAgents,
        }).from(clinicSubscriptions)
          .leftJoin(packages, eq(clinicSubscriptions.packageId, packages.id))
          .where(eq(clinicSubscriptions.clinicId, clinicId))
          .limit(1);
        return newSub;
      }
      return subs[0];
    }),
    subscribe: protectedProcedure
      .input(z.object({ packageId: z.number(), isAnnual: z.boolean().optional(), promoCode: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const clinicId = ctx.user.clinicId || 1;

        const endDate = new Date();
        if (input.isAnnual) {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        const [newSubRes] = await db.insert(clinicSubscriptions).values({
          clinicId,
          packageId: input.packageId,
          status: "active",
          startDate: new Date(),
          endDate,
        });

        const [pkg] = await db.select().from(packages).where(eq(packages.id, input.packageId)).limit(1);
        if (pkg) {
          let baseAmount = Number(pkg.priceMonthly);
          if (input.isAnnual) {
            baseAmount = baseAmount * 12 * 0.8; // 20% annual discount
          }
          if (input.promoCode && input.promoCode.toUpperCase() === "DENTAL10") {
            baseAmount = baseAmount * 0.9;
          }
          await db.insert(subscriptionInvoices).values({
            clinicId,
            subscriptionId: Number(newSubRes.insertId),
            amount: baseAmount.toFixed(2),
            status: "paid",
            dueDate: new Date(),
            paidDate: new Date(),
          });
        }
        return { success: true };
      }),
    upgrade: protectedProcedure
      .input(z.object({ packageId: z.number(), isAnnual: z.boolean().optional(), promoCode: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const clinicId = ctx.user.clinicId || 1;

        await db.update(clinicSubscriptions)
          .set({ status: "cancelled" })
          .where(and(eq(clinicSubscriptions.clinicId, clinicId), eq(clinicSubscriptions.status, "active")));

        const endDate = new Date();
        if (input.isAnnual) {
          endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
          endDate.setMonth(endDate.getMonth() + 1);
        }

        const [newSubRes] = await db.insert(clinicSubscriptions).values({
          clinicId,
          packageId: input.packageId,
          status: "active",
          startDate: new Date(),
          endDate,
        });

        const [pkg] = await db.select().from(packages).where(eq(packages.id, input.packageId)).limit(1);
        if (pkg) {
          let baseAmount = Number(pkg.priceMonthly);
          if (input.isAnnual) {
            baseAmount = baseAmount * 12 * 0.8;
          }
          if (input.promoCode && input.promoCode.toUpperCase() === "DENTAL10") {
            baseAmount = baseAmount * 0.9;
          }
          await db.insert(subscriptionInvoices).values({
            clinicId,
            subscriptionId: Number(newSubRes.insertId),
            amount: baseAmount.toFixed(2),
            status: "paid",
            dueDate: new Date(),
            paidDate: new Date(),
          });
        }
        return { success: true };
      }),
    downgrade: protectedProcedure
      .input(z.object({ packageId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const clinicId = ctx.user.clinicId || 1;

        await db.update(clinicSubscriptions)
          .set({ status: "cancelled" })
          .where(and(eq(clinicSubscriptions.clinicId, clinicId), eq(clinicSubscriptions.status, "active")));

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);

        const [newSubRes] = await db.insert(clinicSubscriptions).values({
          clinicId,
          packageId: input.packageId,
          status: "active",
          startDate: new Date(),
          endDate,
        });

        const [pkg] = await db.select().from(packages).where(eq(packages.id, input.packageId)).limit(1);
        if (pkg) {
          await db.insert(subscriptionInvoices).values({
            clinicId,
            subscriptionId: Number(newSubRes.insertId),
            amount: pkg.priceMonthly,
            status: "paid",
            dueDate: new Date(),
            paidDate: new Date(),
          });
        }
        return { success: true };
      }),
    validatePromo: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(({ input }) => {
        const valid = input.code.toUpperCase() === "DENTAL10" || input.code.toUpperCase() === "WELCOME20";
        if (!valid) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid promo code. Try 'DENTAL10'" });
        }
        return { success: true, discountPercent: 10, message: "Promo code applied: 10% OFF!" };
      }),
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const clinicId = ctx.user.clinicId || 1;
      return await db.select().from(clinicSubscriptions).where(eq(clinicSubscriptions.clinicId, clinicId)).orderBy(desc(clinicSubscriptions.id));
    }),
    getInvoices: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const clinicId = ctx.user.clinicId || 1;
      return await db.select().from(subscriptionInvoices).where(eq(subscriptionInvoices.clinicId, clinicId)).orderBy(desc(subscriptionInvoices.createdAt));
    }),
  }),
});

export type AppRouter = typeof appRouter;
