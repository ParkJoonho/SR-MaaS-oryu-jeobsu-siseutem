import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertErrorSchema, updateErrorSchema } from "@shared/schema";
import { generateErrorTitle } from "./gemini";
import multer from "multer";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer configuration for file uploads
  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage_config,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5 // maximum 5 files
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Generate error title using Gemini AI
  app.post("/api/errors/generate-title", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || content.length < 10) {
        return res.status(400).json({ 
          message: "Content must be at least 10 characters long" 
        });
      }

      const { generateErrorTitle } = await import("./gemini");
      const title = await generateErrorTitle(content);
      
      res.json({ title });
    } catch (error) {
      console.error("Error generating title:", error);
      res.status(500).json({ 
        message: "Failed to generate title" 
      });
    }
  });

  // Analyze system category using Gemini AI
  app.post("/api/errors/analyze-system", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || content.length < 5) {
        return res.status(400).json({ 
          message: "Content must be at least 5 characters long" 
        });
      }

      const { analyzeSystemCategory } = await import("./gemini");
      const system = await analyzeSystemCategory(content);
      
      res.json({ system });
    } catch (error) {
      console.error("Error analyzing system category:", error);
      res.status(500).json({ 
        message: "Failed to analyze system category" 
      });
    }
  });

  // Error management routes
  app.post('/api/errors', isAuthenticated, upload.array('attachments', 5), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const files = req.files as Express.Multer.File[];
      
      // Get file paths if files were uploaded
      const attachments = files ? files.map(file => `/uploads/${file.filename}`) : [];
      
      const errorData = insertErrorSchema.parse({
        ...req.body,
        reporterId: userId,
        attachments: attachments.length > 0 ? attachments : null
      });
      
      const newError = await storage.createError(errorData);
      res.json(newError);
    } catch (error) {
      console.error("Error creating error report:", error);
      res.status(400).json({ message: "Failed to create error report" });
    }
  });

  // Serve uploaded files
  app.get('/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  app.get('/api/errors', isAuthenticated, async (req, res) => {
    try {
      const { search, status, page = "1", limit = "20" } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const result = await storage.getErrors({
        search: search as string,
        status: status as string,
        limit: parseInt(limit as string),
        offset
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching errors:", error);
      res.status(500).json({ message: "Failed to fetch errors" });
    }
  });

  app.get('/api/errors/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid error ID" });
      }
      
      const error = await storage.getError(id);
      
      if (!error) {
        return res.status(404).json({ message: "Error not found" });
      }
      
      res.json(error);
    } catch (error) {
      console.error("Error fetching error:", error);
      res.status(500).json({ message: "Failed to fetch error" });
    }
  });

  app.patch('/api/errors/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid error ID" });
      }
      
      const updates = updateErrorSchema.parse(req.body);
      
      const updatedError = await storage.updateError(id, updates);
      
      if (!updatedError) {
        return res.status(404).json({ message: "Error not found" });
      }
      
      res.json(updatedError);
    } catch (error) {
      console.error("Error updating error:", error);
      res.status(400).json({ message: "Failed to update error" });
    }
  });

  app.delete('/api/errors/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid error ID" });
      }
      const success = await storage.deleteError(id);
      
      if (!success) {
        return res.status(404).json({ message: "Error not found" });
      }
      
      res.json({ message: "Error deleted successfully" });
    } catch (error) {
      console.error("Error deleting error:", error);
      res.status(500).json({ message: "Failed to delete error" });
    }
  });

  // Statistics routes
  app.get('/api/stats/errors', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getErrorStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching error stats:", error);
      res.status(500).json({ message: "Failed to fetch error stats" });
    }
  });

  app.get('/api/stats/weekly', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getWeeklyStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      res.status(500).json({ message: "Failed to fetch weekly stats" });
    }
  });

  app.get('/api/stats/categories', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getCategoryStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching category stats:", error);
      res.status(500).json({ message: "Failed to fetch category stats" });
    }
  });

  // AI title generation route
  app.post('/api/ai/generate-title', isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || content.length < 10) {
        return res.status(400).json({ message: "Content must be at least 10 characters long" });
      }
      
      const title = await generateErrorTitle(content);
      res.json({ title });
    } catch (error) {
      console.error("Error generating title:", error);
      res.status(500).json({ message: "Failed to generate title" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
