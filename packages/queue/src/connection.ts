import { Queue, QueueOptions } from "bullmq";

const connection = (): QueueOptions["connection"] => {
  const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
  const u = new URL(redisUrl);
  return {
    host: u.hostname,
    port: u.port ? parseInt(u.port, 10) : 6379,
    password: u.password || undefined,
    username: u.username || undefined,
  };
};

export function getConnection() {
  return connection();
}
