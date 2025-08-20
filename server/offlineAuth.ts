import session from "express-session";
import type { Express, RequestHandler } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import type { User } from "@shared/schema";
import connectPg from "connect-pg-simple";

const scryptAsync = promisify(scrypt);

// 오프라인 환경에서 사용할 기본 관리자 계정
const DEFAULT_ADMIN = {
  username: "admin",
  password: "admin123!",
  firstName: "관리자",
  lastName: "시스템",
  email: "admin@srmaas.local"
};

declare global {
  namespace Express {
    interface User extends User {}
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function getOfflineSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1주일
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "offline-session-secret-key",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // 오프라인 환경에서는 HTTPS 없이도 작동
      maxAge: sessionTtl,
    },
  });
}

export async function setupOfflineAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getOfflineSession());

  // 기본 관리자 계정 생성 (최초 실행시)
  await ensureDefaultAdmin();

  // 로그인 페이지
  app.get("/auth", (req, res) => {
    if (req.session && (req.session as any).user) {
      return res.redirect("/");
    }
    
    res.send(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SR-MaaS 시스템 로그인</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .login-container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
          }
          h1 { 
            text-align: center; 
            color: #333;
            margin-bottom: 2rem;
          }
          .form-group {
            margin-bottom: 1rem;
          }
          label {
            display: block;
            margin-bottom: 0.5rem;
            color: #555;
            font-weight: 500;
          }
          input[type="text"], input[type="password"] {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            box-sizing: border-box;
          }
          input[type="text"]:focus, input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          button {
            width: 100%;
            padding: 0.75rem;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: 500;
          }
          button:hover {
            background: #5a6fd8;
          }
          .error {
            color: #e53e3e;
            margin-top: 0.5rem;
            font-size: 0.875rem;
          }
          .default-info {
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            color: #4a5568;
          }
          .default-info strong {
            color: #2d3748;
          }
        </style>
      </head>
      <body>
        <div class="login-container">
          <h1>SR-MaaS 통합정보시스템</h1>
          <div class="default-info">
            <strong>기본 계정 정보:</strong><br>
            사용자명: admin<br>
            비밀번호: admin123!
          </div>
          <form action="/api/offline/login" method="POST">
            <div class="form-group">
              <label for="username">사용자명</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
              <label for="password">비밀번호</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">로그인</button>
            ${req.query.error ? `<div class="error">${req.query.error}</div>` : ''}
          </form>
        </div>
      </body>
      </html>
    `);
  });

  // 로그인 처리
  app.post("/api/offline/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.redirect("/auth?error=사용자명과 비밀번호를 입력해주세요.");
      }

      const user = await authenticateUser(username, password);
      if (!user) {
        return res.redirect("/auth?error=잘못된 사용자명 또는 비밀번호입니다.");
      }

      // 세션에 사용자 정보 저장
      (req.session as any).user = user;
      res.redirect("/");
    } catch (error) {
      console.error("로그인 오류:", error);
      res.redirect("/auth?error=로그인 중 오류가 발생했습니다.");
    }
  });

  // 로그아웃
  app.post("/api/offline/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        console.error("로그아웃 오류:", err);
      }
      res.redirect("/auth");
    });
  });

  // 현재 사용자 정보
  app.get("/api/auth/user", (req, res) => {
    const user = (req.session as any)?.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(user);
  });
}

async function ensureDefaultAdmin() {
  try {
    // 기본 관리자 계정이 있는지 확인
    const existingAdmin = await storage.getUserByUsername?.(DEFAULT_ADMIN.username);
    
    if (!existingAdmin) {
      // 기본 관리자 계정 생성
      const hashedPassword = await hashPassword(DEFAULT_ADMIN.password);
      
      await storage.upsertUser({
        id: "offline-admin",
        email: DEFAULT_ADMIN.email,
        firstName: DEFAULT_ADMIN.firstName,
        lastName: DEFAULT_ADMIN.lastName,
        profileImageUrl: null,
        username: DEFAULT_ADMIN.username,
        password: hashedPassword,
      });
      
      console.log("기본 관리자 계정이 생성되었습니다. (admin/admin123!)");
    }
  } catch (error) {
    console.error("기본 관리자 계정 생성 실패:", error);
  }
}

async function authenticateUser(username: string, password: string): Promise<User | null> {
  try {
    const user = await storage.getUserByUsername?.(username);
    if (!user || !user.password) {
      return null;
    }

    const isValid = await comparePasswords(password, user.password);
    if (!isValid) {
      return null;
    }

    // 비밀번호 필드 제거한 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  } catch (error) {
    console.error("사용자 인증 오류:", error);
    return null;
  }
}

export const isOfflineAuthenticated: RequestHandler = (req, res, next) => {
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // req.user에 사용자 정보 설정 (기존 코드 호환성을 위해)
  req.user = user;
  next();
};