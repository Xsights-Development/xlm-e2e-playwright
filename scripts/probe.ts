/**
 * Unified CLI for API/Cube/Admin probes.
 *
 * Usage:
 *   npm run probe -- <command>
 *   npm run probe:health
 *
 * Commands: admin | farm-admin | inventory | cube | health | all
 */
import 'dotenv/config';
import {
  probeAdmin,
  probeAll,
  probeCube,
  probeFarmAdmin,
  probeHealth,
  probeInventory,
} from '@/scripts/lib/probe-runners.js';
import { runProbe } from '@/scripts/lib/probe-shared.js';

const COMMANDS = {
  admin: probeAdmin,
  'farm-admin': probeFarmAdmin,
  inventory: probeInventory,
  cube: probeCube,
  health: probeHealth,
  all: probeAll,
} as const;

type Command = keyof typeof COMMANDS;

function printHelp(): void {
  console.log(`Usage: npm run probe -- <command>

Commands:
  admin        Admin API login + animal list sample
  farm-admin   Admin farm name + manager oracle
  inventory    App API GET /stats/tags (G/S active tags)
  cube         Cube load farm-tags-deployed (pivot rows)
  health       Cube farm health alerts + events oracles
  all          inventory + cube + health

Only npm script: npm run probe -- <command>
`);
}

const arg = process.argv[2]?.trim();

if (!arg || arg === 'help' || arg === '-h' || arg === '--help') {
  printHelp();
  process.exit(arg ? 0 : 1);
}

const command = arg as Command;
const runner = COMMANDS[command];

if (!runner) {
  console.error(`Unknown command: ${arg}\n`);
  printHelp();
  process.exit(1);
}

runProbe(runner);
