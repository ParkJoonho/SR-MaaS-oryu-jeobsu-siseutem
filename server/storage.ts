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
  // User operations - supports both Replit Auth and offline auth
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername?(username: string): Promise<User | undefined>;
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
    // 간단한 접근방식으로 변경: 실제 데이터를 주차별로 그룹화
    const now = new Date();
    const sevenWeeksAgo = new Date(now.getTime() - 7 * 7 * 24 * 60 * 60 * 1000);
    
    // 모든 오류를 조회하여 JavaScript에서 처리
    const allErrors = await db
      .select({
        id: errors.id,
        createdAt: errors.createdAt,
        updatedAt: errors.updatedAt,
        status: errors.status
      })
      .from(errors)
      .where(gte(errors.createdAt, sevenWeeksAgo))
      .orderBy(desc(errors.createdAt));

    // 주차별 데이터 계산
    const weekMap = new Map<string, { errors: number; resolved: number }>();

    // 최근 7주 데이터 초기화
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const monday = new Date(weekStart);
      monday.setDate(monday.getDate() - monday.getDay() + 1);
      const weekLabel = `${monday.getMonth() + 1}월 ${monday.getDate()}일`;
      weekMap.set(weekLabel, { errors: 0, resolved: 0 });
    }

    // 오류 데이터 처리
    allErrors.forEach(error => {
      if (error.createdAt) {
        const errorDate = new Date(error.createdAt);
        const monday = new Date(errorDate);
        monday.setDate(monday.getDate() - monday.getDay() + 1);
        const weekLabel = `${monday.getMonth() + 1}월 ${monday.getDate()}일`;
        
        const weekStats = weekMap.get(weekLabel);
        if (weekStats) {
          weekStats.errors++;
          if (error.status === '완료') {
            weekStats.resolved++;
          }
        }
      }
    });

    // 결과 배열로 변환
    const result: Array<{ week: string; errors: number; resolved: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const monday = new Date(weekStart);
      monday.setDate(monday.getDate() - monday.getDay() + 1);
      const weekLabel = `${monday.getMonth() + 1}월 ${monday.getDate()}일`;
      
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
