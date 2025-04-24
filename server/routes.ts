import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertProgressDataSchema, insertTerminalLogSchema } from "@shared/schema";

// Add type declaration at the file level
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware to get or create a user
async function getOrCreateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.body.username || 'guest-' + Math.random().toString(36).substring(2, 10);
    
    // Find user or create new one
    let user = await storage.getUserByUsername(username);
    
    if (!user) {
      // Create new user with default password
      user = await storage.createUser({
        username,
        password: 'dharma' // Default password
      });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in getOrCreateUser middleware:", error);
    res.status(500).json({ message: "Failed to authenticate user" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // API route to track user progress
  app.post('/api/progress', getOrCreateUser, async (req, res) => {
    try {
      const { data } = req.body;
      const userId = req.user.id;
      
      // Validate progress data
      const validatedData = insertProgressDataSchema.parse(data);
      
      // Update user's progress data in the database
      await storage.updateUserProgress(userId, validatedData);
      
      res.json({ success: true, userId });
    } catch (error) {
      console.error("Error saving progress:", error);
      res.status(500).json({ message: "Failed to save progress" });
    }
  });
  
  // API route to get user data
  app.get('/api/user', getOrCreateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user progress data
      const progressData = await storage.getProgressData(userId);
      
      // Get user's discovered stations
      const discoveredStations = await storage.getDiscoveredStations(userId);
      
      // Get user's unlocked audio logs
      const unlockedLogs = await storage.getUnlockedAudioLogs(userId);
      
      // Get user's unlocked incident reports
      const unlockedReports = await storage.getUnlockedIncidentReports(userId);
      
      res.json({ 
        user: {
          id: req.user.id,
          username: req.user.username,
        },
        progressData,
        discoveredStations: discoveredStations.map(s => s.name.toLowerCase()),
        unlockedLogs,
        unlockedReports
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });
  
  // API route to log terminal commands
  app.post('/api/terminal/log', getOrCreateUser, async (req, res) => {
    try {
      const { command, response } = req.body;
      const userId = req.user.id;
      
      // Make sure command is defined
      if (!command) {
        return res.status(400).json({ message: "Command is required" });
      }
      
      // Prepare data for validation with required command
      const logData = {
        userId,
        command,  // Command is now guaranteed to exist
        response: response ? JSON.stringify(response) : undefined
      };
      
      // Validate terminal log data
      const validatedData = insertTerminalLogSchema.parse(logData);
      
      // Save terminal log
      const log = await storage.saveTerminalLog(validatedData);
      
      res.json({ success: true, log });
    } catch (error) {
      console.error("Error logging terminal command:", error);
      res.status(500).json({ message: "Failed to log terminal command" });
    }
  });
  
  // API route to discover a station
  app.post('/api/stations/discover', getOrCreateUser, async (req, res) => {
    try {
      const { stationName } = req.body;
      const userId = req.user.id;
      
      if (!stationName) {
        return res.status(400).json({ message: "Station name is required" });
      }
      
      // Mark station as discovered
      await storage.setStationDiscovered(userId, stationName);
      
      // Get all discovered stations
      const discoveredStations = await storage.getDiscoveredStations(userId);
      
      res.json({ 
        success: true, 
        discoveredStations: discoveredStations.map(s => s.name.toLowerCase())
      });
    } catch (error) {
      console.error("Error discovering station:", error);
      res.status(500).json({ message: "Failed to discover station" });
    }
  });
  
  // API route to unlock an audio log
  app.post('/api/logs/unlock', getOrCreateUser, async (req, res) => {
    try {
      const { logId } = req.body;
      const userId = req.user.id;
      
      if (!logId) {
        return res.status(400).json({ message: "Log ID is required" });
      }
      
      // Unlock audio log
      await storage.unlockAudioLog(userId, logId);
      
      // Get all unlocked logs
      const unlockedLogs = await storage.getUnlockedAudioLogs(userId);
      
      res.json({ success: true, unlockedLogs });
    } catch (error) {
      console.error("Error unlocking audio log:", error);
      res.status(500).json({ message: "Failed to unlock audio log" });
    }
  });
  
  // API route to unlock an incident report
  app.post('/api/reports/unlock', getOrCreateUser, async (req, res) => {
    try {
      const { reportId } = req.body;
      const userId = req.user.id;
      
      if (reportId === undefined) {
        return res.status(400).json({ message: "Report ID is required" });
      }
      
      // Unlock incident report
      await storage.unlockIncidentReport(userId, parseInt(reportId));
      
      // Get all unlocked reports
      const unlockedReports = await storage.getUnlockedIncidentReports(userId);
      
      res.json({ success: true, unlockedReports });
    } catch (error) {
      console.error("Error unlocking incident report:", error);
      res.status(500).json({ message: "Failed to unlock incident report" });
    }
  });
  
  // API route to reset countdown
  app.post('/api/countdown/reset', getOrCreateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Reset countdown
      await storage.resetCountdown(userId);
      
      res.json({ success: true, resetTime: new Date() });
    } catch (error) {
      console.error("Error resetting countdown:", error);
      res.status(500).json({ message: "Failed to reset countdown" });
    }
  });
  
  // API route to get station information
  app.get('/api/stations', async (req, res) => {
    try {
      // Get all stations
      const allStations = await storage.getAudioLogs();
      
      // If no stations in database yet, return hardcoded data
      if (!allStations || allStations.length === 0) {
        const stations = [
          { id: 'swan', name: 'The Swan', code: 'Station 3', description: 'Electromagnetic research' },
          { id: 'pearl', name: 'The Pearl', code: 'Station 5', description: 'Psychological research' },
          { id: 'flame', name: 'The Flame', code: 'Station 4', description: 'Communications' },
          { id: 'arrow', name: 'The Arrow', code: 'Station 1', description: 'Defense & armament' },
          { id: 'staff', name: 'The Staff', code: 'Station 6', description: 'Medical research' },
          { id: 'orchid', name: 'The Orchid', code: 'Station 7', description: 'Time displacement research' },
        ];
        
        return res.json(stations);
      }
      
      res.json(allStations);
    } catch (error) {
      console.error("Error fetching stations:", error);
      res.status(500).json({ message: "Failed to fetch stations" });
    }
  });
  
  // API route to get audio logs
  app.get('/api/logs', async (req, res) => {
    try {
      // Get all audio logs
      const allLogs = await storage.getAudioLogs();
      
      // If no logs in database yet, return hardcoded data
      if (!allLogs || allLogs.length === 0) {
        const logs = [
          { id: 'orientationVideo', title: 'Orientation Video', locked: false },
          { id: 'distressSignal', title: 'Distress Signal', locked: true },
          { id: 'radioTransmission', title: 'Radio Transmission', locked: true },
          { id: 'unknownSource', title: 'Unknown Source', locked: true },
        ];
        
        return res.json(logs);
      }
      
      res.json(allLogs);
    } catch (error) {
      console.error("Error fetching audio logs:", error);
      res.status(500).json({ message: "Failed to fetch audio logs" });
    }
  });
  
  // API route to get incident reports
  app.get('/api/reports', async (req, res) => {
    try {
      // Get all incident reports
      const allReports = await storage.getIncidentReports();
      
      // If no reports in database yet, return hardcoded data
      if (!allReports || allReports.length === 0) {
        const reports = [
          { id: 0, title: 'THE INCIDENT', locked: true },
          { id: 1, title: 'ELECTROMAGNETIC ANOMALY', locked: true },
          { id: 2, title: 'SYSTEM FAILURE LOG', locked: true },
        ];
        
        return res.json(reports);
      }
      
      // Map database reports to API format
      const mappedReports = allReports.map(report => ({
        id: report.id,
        title: report.title,
        locked: report.isHidden,
        classification: report.classification,
        content: report.content
      }));
      
      res.json(mappedReports);
    } catch (error) {
      console.error("Error fetching incident reports:", error);
      res.status(500).json({ message: "Failed to fetch incident reports" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
