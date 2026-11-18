import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { DeviceType } from '@prisma/client';

export interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  deviceType?: DeviceType;
  browser?: string;
  os?: string;
  ipAddress?: string;
}

export class SessionService {
  /**
   * Register a new device session with dual-device limit (max 2 FIFO eviction).
   */
  static async registerSession(userId: string, deviceInfo: DeviceInfo, refreshToken: string) {
    const { deviceId, deviceName, deviceType = DeviceType.DESKTOP, browser, os, ipAddress } = deviceInfo;

    // 1. Check if this exact device is already registered
    const existing = await prisma.deviceSession.findFirst({
      where: { userId, deviceId },
    });

    if (existing) {
      return prisma.deviceSession.update({
        where: { id: existing.id },
        data: {
          refreshToken,
          deviceName: deviceName || existing.deviceName,
          browser: browser || existing.browser,
          os: os || existing.os,
          ipAddress: ipAddress || existing.ipAddress,
          lastActiveAt: new Date(),
        },
      });
    }

    // 2. Count active sessions for user
    const userSessions = await prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'asc' },
    });

    // 3. FIFO Eviction if reaching or exceeding limit
    if (userSessions.length >= ENV.MAX_ALLOWED_DEVICES) {
      const sessionsToEvictCount = userSessions.length - ENV.MAX_ALLOWED_DEVICES + 1;
      const sessionsToEvict = userSessions.slice(0, sessionsToEvictCount);
      const evictIds = sessionsToEvict.map((s) => s.id);

      await prisma.deviceSession.deleteMany({
        where: { id: { in: evictIds } },
      });
    }

    // 4. Create new session
    return prisma.deviceSession.create({
      data: {
        userId,
        deviceId,
        deviceName: deviceName || `${os || 'Unknown OS'} - ${browser || 'Browser'}`,
        deviceType,
        browser,
        os,
        ipAddress,
        refreshToken,
        lastActiveAt: new Date(),
      },
    });
  }

  /**
   * Verify if a session is still valid (not evicted).
   */
  static async validateSession(sessionId: string): Promise<boolean> {
    const session = await prisma.deviceSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) return false;

    // Update lastActiveAt periodically
    await prisma.deviceSession.update({
      where: { id: sessionId },
      data: { lastActiveAt: new Date() },
    });

    return true;
  }

  /**
   * Get all active sessions for a user.
   */
  static async getUserSessions(userId: string) {
    return prisma.deviceSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        deviceType: true,
        browser: true,
        os: true,
        ipAddress: true,
        lastActiveAt: true,
        createdAt: true,
      },
    });
  }

  /**
   * Terminate a specific device session (Remote logout).
   */
  static async terminateSession(userId: string, sessionId: string) {
    return prisma.deviceSession.deleteMany({
      where: { id: sessionId, userId },
    });
  }

  /**
   * Terminate all other sessions for user.
   */
  static async terminateOtherSessions(userId: string, currentSessionId: string) {
    return prisma.deviceSession.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });
  }
}
