import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const CAPABILITY_TTL_MS = 24 * 60 * 60 * 1000;

export type JobCapabilityRecord = {
  capability_hash: string | null;
  capability_expires_at: string | Date | null;
};

export function createJobCapability() {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + CAPABILITY_TTL_MS);
  return { token, hash: hashJobCapability(token), expiresAt };
}

export function hashJobCapability(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieValue(request: Request, id: string) {
  const cookieName = `bearing_job_${id}`;
  const cookie = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  return cookie?.slice(cookieName.length + 1) || "";
}

function presentedCapability(request: Request, id: string) {
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.match(/^Bearer\s+([^\s]+)$/i)?.[1];
  return bearer || cookieValue(request, id);
}

export function hasJobCapability(request: Request, id: string, record: JobCapabilityRecord) {
  if (!record.capability_hash || !record.capability_expires_at) return false;
  const expiresAt = new Date(record.capability_expires_at).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
  const presented = presentedCapability(request, id);
  if (!presented || !/^[A-Za-z0-9_-]{40,100}$/.test(presented) || !/^[a-f0-9]{64}$/i.test(record.capability_hash)) return false;
  const expected = Buffer.from(record.capability_hash, "hex");
  const actual = Buffer.from(hashJobCapability(presented), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function jobMutationError(request: Request, id: string, record: JobCapabilityRecord) {
  if (!sameOrigin(request)) return { error: "csrf_origin_mismatch", status: 403 } as const;
  if (!hasJobCapability(request, id, record)) return { error: "job_capability_required", status: 401 } as const;
  return null;
}

export function sameOrigin(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin && origin !== requestOrigin) return false;
  const referer = request.headers.get("referer");
  if (!origin && referer) {
    try { if (new URL(referer).origin !== requestOrigin) return false; } catch { return false; }
  }
  return true;
}

export function setJobCapabilityCookie(response: Response, request: Request, id: string, token: string, expiresAt: Date) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  response.headers.append("Set-Cookie", `bearing_job_${id}=${token}; Max-Age=${Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))}; Path=/; HttpOnly; SameSite=Lax${secure}`);
}
