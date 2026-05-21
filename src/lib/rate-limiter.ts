import { prisma } from "@/lib/prisma";

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();

  const existing = await prisma.rateLimit.findUnique({ where: { key } });

  if (!existing || now >= existing.expiresAt.getTime()) {
    await prisma.rateLimit.upsert({
      where: { key },
      update: { count: 1, expiresAt: new Date(now + config.windowMs) },
      create: { key, count: 1, expiresAt: new Date(now + config.windowMs) },
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (existing.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.expiresAt.getTime() };
  }

  await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count - 1,
    resetAt: existing.expiresAt.getTime(),
  };
}

export async function clearRateLimit(key: string): Promise<void> {
  await prisma.rateLimit.delete({ where: { key } }).catch(() => {});
}

export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
};

export const PASSWORD_RESET_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000,
};
