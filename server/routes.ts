import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to track user progress
  app.post('/api/progress', async (req, res) => {
    try {
      const { username, data } = req.body;
      
      // Find user or create new one
      let user = await storage.getUserByUsername(username);
      
      if (!user) {
        // Create new user with default password
        user = await storage.createUser({
          username,
          password: 'dharma' // Default password
        });
      }
      
      // Update user's progress data
      // In a real app, we would store this in the database
      res.json({ success: true, userId: user.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to save progress" });
    }
  });
  
  // API route to get station information
  app.get('/api/stations', (req, res) => {
    const stations = [
      { id: 'swan', name: 'The Swan', code: 'Station 3', description: 'Electromagnetic research' },
      { id: 'pearl', name: 'The Pearl', code: 'Station 5', description: 'Psychological research' },
      { id: 'flame', name: 'The Flame', code: 'Station 4', description: 'Communications' },
      { id: 'arrow', name: 'The Arrow', code: 'Station 1', description: 'Defense & armament' },
      { id: 'staff', name: 'The Staff', code: 'Station 6', description: 'Medical research' },
      { id: 'orchid', name: 'The Orchid', code: 'Station 7', description: 'Time displacement research' },
    ];
    
    res.json(stations);
  });
  
  // API route to get audio logs
  app.get('/api/logs', (req, res) => {
    const logs = [
      { id: 'orientationVideo', title: 'Orientation Video', locked: false },
      { id: 'distressSignal', title: 'Distress Signal', locked: true },
      { id: 'radioTransmission', title: 'Radio Transmission', locked: true },
      { id: 'unknownSource', title: 'Unknown Source', locked: true },
    ];
    
    res.json(logs);
  });
  
  // API route to get incident reports
  app.get('/api/reports', (req, res) => {
    const reports = [
      { id: 0, title: 'THE INCIDENT', locked: true },
      { id: 1, title: 'ELECTROMAGNETIC ANOMALY', locked: true },
      { id: 2, title: 'SYSTEM FAILURE LOG', locked: true },
    ];
    
    res.json(reports);
  });

  const httpServer = createServer(app);
  return httpServer;
}
