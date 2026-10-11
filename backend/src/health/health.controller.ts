import { Controller, Get } from "@nestjs/common";
import {
  arch,
  cpus,
  freemem,
  hostname,
  loadavg,
  platform,
  totalmem,
  uptime,
} from "node:os";

const MB = 1048576;
const SAMPLE_MS = 120;

const round = (n: number): number => Math.round(n * 10) / 10;

const cpuUsagePct = async (): Promise<number> => {
  const a = cpus();
  await new Promise((r) => setTimeout(r, SAMPLE_MS));
  const b = cpus();
  let tot = 0;
  let idl = 0;
  for (let i = 0; i < b.length; i++) {
    const at = a[i].times;
    const bt = b[i].times;
    tot +=
      bt.user - at.user +
      (bt.nice - at.nice) +
      (bt.sys - at.sys) +
      (bt.idle - at.idle) +
      (bt.irq - at.irq);
    idl += bt.idle - at.idle;
  }
  if (tot <= 0) return 0;
  return Math.min(100, Math.max(0, ((tot - idl) / tot) * 100));
};

@Controller("health")
export class HealthController {
  @Get()
  async health(): Promise<Record<string, unknown>> {
    const usage = await cpuUsagePct();
    const total = totalmem();
    const free = freemem();
    const used = total - free;
    const memPct = total > 0 ? (used / total) * 100 : 0;
    const status = usage > 90 || memPct > 92 ? "degraded" : "ok";
    const mem = process.memoryUsage();
    return {
      status,
      timestamp: new Date().toISOString(),
      uptimeSec: round(uptime()),
      server: {
        hostname: hostname(),
        platform: platform(),
        arch: arch(),
        node: process.version,
        pid: process.pid,
        cpuCores: cpus().length,
        cpuModel: cpus()[0]?.model.trim() ?? "",
        loadAvg: loadavg().map(round),
      },
      memory: {
        totalMB: Math.round(total / MB),
        freeMB: Math.round(free / MB),
        usedMB: Math.round(used / MB),
        usedPct: round(memPct),
        rssMB: Math.round(mem.rss / MB),
        heapUsedMB: Math.round(mem.heapUsed / MB),
        heapTotalMB: Math.round(mem.heapTotal / MB),
      },
      cpu: { usagePct: round(usage) },
    };
  }
}
