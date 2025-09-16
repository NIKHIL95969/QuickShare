import { getRedisClient } from './redisClient';

const ONE_DAY_SECONDS = 60 * 60 * 24;
const env = process.env.ENV

function getNamespace(temp: boolean | null): string {
  return temp ? 'temp' : 'all';
}

function versionKey(namespace: string): string {
  return `${env}:list:v:${namespace}`;
}

async function getVersion(namespace: string): Promise<string> {
  const redis = await getRedisClient();
  const key = versionKey(namespace);
  const v = await redis.get(key);
  if (v) return String(v);
  await redis.set(key, '1');
  return '1';
}

export async function bumpListVersion(temp: boolean | null): Promise<void> {
  const redis = await getRedisClient();
  const ns = getNamespace(temp);
  await redis.incr(versionKey(ns));
}

function pageKeyBase(ns: string, page: number, limit: number): string {
  return `${env}:list:${ns}:p:${page}:l:${limit}`;
}

export async function getListCache(temp: boolean | null, page: number, limit: number): Promise<string | null> {
  const redis = await getRedisClient();
  const ns = getNamespace(temp);
  const v = await getVersion(ns);
  const key = `${pageKeyBase(ns, page, limit)}:v:${v}`;
  return await redis.get(key);
}

export async function setListCache(temp: boolean | null, page: number, limit: number, payload: unknown): Promise<void> {
  const redis = await getRedisClient();
  const ns = getNamespace(temp);
  const v = await getVersion(ns);
  const key = `${pageKeyBase(ns, page, limit)}:v:${v}`;
  await redis.set(key, JSON.stringify(payload));
  await redis.expire(key, ONE_DAY_SECONDS);
}


