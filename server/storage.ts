import { users, 
         stations, 
         audioLogs, 
         incidentReports, 
         progressData, 
         terminalLogs,
         type User, 
         type InsertUser, 
         type Station, 
         type InsertStation, 
         type AudioLog, 
         type InsertAudioLog, 
         type IncidentReport, 
         type InsertIncidentReport, 
         type ProgressData, 
         type InsertProgressData, 
         type TerminalLog, 
         type InsertTerminalLog } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProgress(userId: number, progressDataUpdate: Partial<InsertProgressData>): Promise<void>;
  
  // Station methods
  getStation(id: number): Promise<Station | undefined>;
  getStationByName(name: string): Promise<Station | undefined>;
  getDiscoveredStations(userId: number): Promise<Station[]>;
  setStationDiscovered(userId: number, stationName: string): Promise<void>;
  
  // Terminal logs methods
  saveTerminalLog(log: InsertTerminalLog): Promise<TerminalLog>;
  getTerminalLogs(userId: number, limit?: number): Promise<TerminalLog[]>;
  
  // Audio logs methods
  getAudioLogs(): Promise<AudioLog[]>;
  unlockAudioLog(userId: number, logId: string): Promise<void>;
  getUnlockedAudioLogs(userId: number): Promise<string[]>;
  
  // Incident reports methods
  getIncidentReports(): Promise<IncidentReport[]>;
  unlockIncidentReport(userId: number, reportId: number): Promise<void>;
  getUnlockedIncidentReports(userId: number): Promise<number[]>;
  
  // Progress data methods
  getProgressData(userId: number): Promise<ProgressData | undefined>;
  resetCountdown(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ 
        ...insertUser, 
        progressData: null, // Use null instead of empty object
        lastLogin: new Date()
      })
      .returning();
    return user;
  }
  
  async updateUserProgress(userId: number, progressDataUpdate: Partial<InsertProgressData>): Promise<void> {
    // First check if progress data exists for this user
    const [existingData] = await db
      .select()
      .from(progressData)
      .where(eq(progressData.userId, userId));
      
    if (existingData) {
      // Update existing record
      await db
        .update(progressData)
        .set(progressDataUpdate)
        .where(eq(progressData.userId, userId));
    } else {
      // Create new record
      await db
        .insert(progressData)
        .values({
          userId,
          ...progressDataUpdate,
          stationsDiscovered: progressDataUpdate.stationsDiscovered || [],
          puzzlesSolved: progressDataUpdate.puzzlesSolved || [],
          logsUnlocked: progressDataUpdate.logsUnlocked || [],
        });
    }
  }

  // Station methods
  async getStation(id: number): Promise<Station | undefined> {
    const [station] = await db.select().from(stations).where(eq(stations.id, id));
    return station;
  }
  
  async getStationByName(name: string): Promise<Station | undefined> {
    const [station] = await db
      .select()
      .from(stations)
      .where(eq(stations.name, name));
    return station;
  }
  
  async getDiscoveredStations(userId: number): Promise<Station[]> {
    // Get user's progress data
    const [userData] = await db
      .select()
      .from(progressData)
      .where(eq(progressData.userId, userId));
      
    if (!userData || !userData.stationsDiscovered || !Array.isArray(userData.stationsDiscovered)) {
      return [];
    }
    
    // Get all stations that have been discovered
    const discoveredStations = await db
      .select()
      .from(stations)
      .where(eq(stations.isHidden, false));
      
    return discoveredStations;
  }
  
  async setStationDiscovered(userId: number, stationName: string): Promise<void> {
    // First get the station
    const [station] = await db
      .select()
      .from(stations)
      .where(eq(stations.name, stationName));
      
    if (!station) {
      throw new Error(`Station "${stationName}" not found`);
    }
    
    // Update the station to be no longer hidden
    await db
      .update(stations)
      .set({ isHidden: false, discoveredBy: userId })
      .where(eq(stations.id, station.id));
      
    // Update user's progress data
    const [userData] = await db
      .select()
      .from(progressData)
      .where(eq(progressData.userId, userId));
      
    if (userData) {
      // Ensure we have a valid array
      const stationsDiscovered = Array.isArray(userData.stationsDiscovered) 
        ? userData.stationsDiscovered 
        : [];
        
      if (!stationsDiscovered.includes(stationName)) {
        await db
          .update(progressData)
          .set({ 
            stationsDiscovered: [...stationsDiscovered, stationName] 
          })
          .where(eq(progressData.id, userData.id));
      }
    } else {
      // Create new progress data for user
      await db
        .insert(progressData)
        .values({
          userId,
          stationsDiscovered: [stationName],
          puzzlesSolved: [],
          logsUnlocked: [],
        });
    }
  }

  // Terminal logs methods
  async saveTerminalLog(log: InsertTerminalLog): Promise<TerminalLog> {
    const [savedLog] = await db
      .insert(terminalLogs)
      .values({
        ...log,
        timestamp: new Date()
      })
      .returning();
    return savedLog;
  }
  
  async getTerminalLogs(userId: number, limit: number = 10): Promise<TerminalLog[]> {
    const logs = await db
      .select()
      .from(terminalLogs)
      .where(eq(terminalLogs.userId, userId))
      .orderBy(terminalLogs.timestamp)
      .limit(limit);
    return logs;
  }

  // Audio logs methods
  async getAudioLogs(): Promise<AudioLog[]> {
    const logs = await db
      .select()
      .from(audioLogs);
    return logs;
  }
  
  async unlockAudioLog(userId: number, logId: string): Promise<void> {
    // Update audio log to be unlocked
    await db
      .update(audioLogs)
      .set({ 
        isLocked: false,
        unlockedBy: userId
      })
      .where(eq(audioLogs.title, logId));
      
    // Update user's progress data
    const [userData] = await db
      .select()
      .from(progressData)
      .where(eq(progressData.userId, userId));
      
    if (userData) {
      // Ensure we have a valid array
      const logsUnlocked = Array.isArray(userData.logsUnlocked) 
        ? userData.logsUnlocked 
        : [];
        
      if (!logsUnlocked.includes(logId)) {
        await db
          .update(progressData)
          .set({ 
            logsUnlocked: [...logsUnlocked, logId] 
          })
          .where(eq(progressData.id, userData.id));
      }
    } else {
      // Create new progress data for user
      await db
        .insert(progressData)
        .values({
          userId,
          stationsDiscovered: [],
          puzzlesSolved: [],
          logsUnlocked: [logId],
        });
    }
  }
  
  async getUnlockedAudioLogs(userId: number): Promise<string[]> {
    // Get user's progress data
    const [userData] = await db
      .select()
      .from(progressData)
      .where(eq(progressData.userId, userId));
      
    if (!userData || !userData.logsUnlocked || !Array.isArray(userData.logsUnlocked)) {
      return [];
    }
    
    return userData.logsUnlocked;
  }

  // Incident reports methods
  async getIncidentReports(): Promise<IncidentReport[]> {
    const reports = await db
      .select()
      .from(incidentReports);
    return reports;
  }
  
  async unlockIncidentReport(userId: number, reportId: number): Promise<void> {
    // Update incident report to be no longer hidden
    await db
      .update(incidentReports)
      .set({ isHidden: false })
      .where(eq(incidentReports.id, reportId));
      
    // Update user's progress data to track unlocked reports
    const [userData] = await db
      .select()
      .from(progressData)
      .where(eq(progressData.userId, userId));
      
    if (userData) {
      // Ensure we have a valid array
      const puzzlesSolved = Array.isArray(userData.puzzlesSolved) 
        ? userData.puzzlesSolved 
        : [];
        
      // We track unlocked incident reports in the puzzlesSolved array
      if (!puzzlesSolved.includes(reportId.toString())) {
        await db
          .update(progressData)
          .set({ 
            puzzlesSolved: [...puzzlesSolved, reportId.toString()] 
          })
          .where(eq(progressData.id, userData.id));
      }
    } else {
      // Create new progress data for user
      await db
        .insert(progressData)
        .values({
          userId,
          stationsDiscovered: [],
          puzzlesSolved: [reportId.toString()],
          logsUnlocked: [],
        });
    }
  }
  
  async getUnlockedIncidentReports(userId: number): Promise<number[]> {
    // Get user's progress data
    const [userData] = await db
      .select()
      .from(progressData)
      .where(eq(progressData.userId, userId));
      
    if (!userData || !userData.puzzlesSolved || !Array.isArray(userData.puzzlesSolved)) {
      return [];
    }
    
    // Convert string IDs to numbers
    return userData.puzzlesSolved
      .map((id: string) => parseInt(id, 10))
      .filter((id: number) => !isNaN(id));
  }

  // Progress data methods
  async getProgressData(userId: number): Promise<ProgressData | undefined> {
    const [data] = await db
      .select()
      .from(progressData)
      .where(eq(progressData.userId, userId));
    return data;
  }
  
  async resetCountdown(userId: number): Promise<void> {
    // Update user's progress data with the latest countdown reset
    const [userData] = await db
      .select()
      .from(progressData)
      .where(eq(progressData.userId, userId));
      
    if (userData) {
      await db
        .update(progressData)
        .set({ 
          lastCountdownReset: new Date() 
        })
        .where(eq(progressData.id, userData.id));
    } else {
      // Create new progress data for user
      await db
        .insert(progressData)
        .values({
          userId,
          stationsDiscovered: [],
          puzzlesSolved: [],
          logsUnlocked: [],
          lastCountdownReset: new Date(),
        });
    }
  }
}

export const storage = new DatabaseStorage();
