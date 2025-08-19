import {
  users,
  errors,
  type User,
  type UpsertUser,
  type InsertError,
  type UpdateError,
  type Error,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, count, sql, gte } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Error operations
  createError(error: InsertError): Promise<Error>;
  getErrors(options?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ errors: Error[]; total: number }>;
  getError(id: number): Promise<Error | undefined>;
  updateError(id: number, updates: UpdateError): Promise<Error | undefined>;
  deleteError(id: number): Promise<boolean>;
  getErrorStats(): Promise<{
    newErrors: number;
    inProgress: number;
    completed: number;
    onHold: number;
  }>;
  getWeeklyStats(): Promise<Array<{ week: string; errors: number; resolved: number }>>;
  getCategoryStats(): Promise<Array<{ category: string; count: number }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Error operations
  async createError(error: InsertError): Promise<Error> {
    const [newError] = await db.insert(errors).values(error).returning();
    return newError;
  }

  async getErrors(options: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ errors: Error[]; total: number }> {
    const { search, status, limit = 20, offset = 0 } = options;

    let whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(errors.title, `%${search}%`),
          like(errors.content, `%${search}%`)
        )
      );
    }
    
    if (status && status !== "모든 상태") {
      whereConditions.push(eq(errors.status, status));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [errorResults, totalResults] = await Promise.all([
      db.select().from(errors)
        .where(whereClause)
        .orderBy(desc(errors.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(errors).where(whereClause)
    ]);

    return {
      errors: errorResults,
      total: totalResults[0].count
    };
  }

  async getError(id: number): Promise<Error | undefined> {
    const [error] = await db.select().from(errors).where(eq(errors.id, id));
    return error;
  }

  async updateError(id: number, updates: UpdateError): Promise<Error | undefined> {
    const [updatedError] = await db
      .update(errors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(errors.id, id))
      .returning();
    return updatedError;
  }

  async deleteError(id: number): Promise<boolean> {
    const result = await db.delete(errors).where(eq(errors.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getErrorStats(): Promise<{
    newErrors: number;
    inProgress: number;
    completed: number;
    onHold: number;
  }> {
    const stats = await db
      .select({
        status: errors.status,
        count: count()
      })
      .from(errors)
      .groupBy(errors.status);

    const result = {
      newErrors: 0,
      inProgress: 0,
      completed: 0,
      onHold: 0
    };

    stats.forEach(stat => {
      switch (stat.status) {
        case "접수됨":
          result.newErrors = stat.count;
          break;
        case "처리중":
          result.inProgress = stat.count;
          break;
        case "완료":
          result.completed = stat.count;
          break;
        case "보류":
          result.onHold = stat.count;
          break;
      }
    });

    return result;
  }

  async getWeeklyStats(): Promise<Array<{ week: string; errors: number; resolved: number }>> {
    // 최근 7주간의 실제 데이터를 조회합니다
    const now = new Date();
    const sevenWeeksAgo = new Date(now.getTime() - 7 * 7 * 24 * 60 * 60 * 1000);
    
    const errorStats = await db
      .select({
        week: sql<string>`TO_CHAR(DATE_TRUNC('week', ${errors.createdAt}), 'MM월 DD일')`,
        errors: count(),
      })
      .from(errors)
      .where(gte(errors.createdAt, sevenWeeksAgo))
      .groupBy(sql`DATE_TRUNC('week', ${errors.createdAt})`)
      .orderBy(sql`DATE_TRUNC('week', ${errors.createdAt})`);

    const resolvedStats = await db
      .select({
        week: sql<string>`TO_CHAR(DATE_TRUNC('week', ${errors.updatedAt}), 'MM월 DD일')`,
        resolved: count(),
      })
      .from(errors)
      .where(
        and(
          gte(errors.updatedAt, sevenWeeksAgo),
          eq(errors.status, "완료")
        )
      )
      .groupBy(sql`DATE_TRUNC('week', ${errors.updatedAt})`)
      .orderBy(sql`DATE_TRUNC('week', ${errors.updatedAt})`);

    // 주차별로 병합
    const weekMap = new Map<string, { errors: number; resolved: number }>();
    
    errorStats.forEach(stat => {
      weekMap.set(stat.week, { errors: stat.errors, resolved: 0 });
    });

    resolvedStats.forEach(stat => {
      const existing = weekMap.get(stat.week) || { errors: 0, resolved: 0 };
      weekMap.set(stat.week, { ...existing, resolved: stat.resolved });
    });

    // 최근 7주간 빈 주차도 포함하여 데이터 구성
    const result: Array<{ week: string; errors: number; resolved: number }> = [];
    
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // 월요일로 설정
      const weekLabel = `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일`;
      
      const stats = weekMap.get(weekLabel) || { errors: 0, resolved: 0 };
      result.push({
        week: weekLabel,
        errors: stats.errors,
        resolved: stats.resolved
      });
    }

    return result;
  }

  async getCategoryStats(): Promise<Array<{ category: string; count: number }>> {
    const stats = await db
      .select({
        system: errors.system,
        count: count()
      })
      .from(errors)
      .groupBy(errors.system);

    return stats.map(stat => ({
      category: stat.system,
      count: stat.count
    }));
  }
}

export const storage = new DatabaseStorage();
