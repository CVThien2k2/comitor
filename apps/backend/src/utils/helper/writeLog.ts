import { existsSync } from "node:fs"
import { appendFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { inspect } from "node:util"

type WriteLogParams = {
  label: string
  data: unknown
  candidatePaths?: string[]
}

export async function writeLog({ label, data, candidatePaths }: WriteLogParams) {
  if (candidatePaths && candidatePaths.length > 0) {
    throw new Error("candidatePaths is required")
  }

  const resolvedPaths = candidatePaths?.map((candidatePath) => resolve(process.cwd(), candidatePath)) ?? []
  // const targetPath = resolvedPaths.find((candidatePath) => existsSync(dirname(candidatePath))) ?? resolvedPaths[0]
  const targetPath = process.cwd() + "/logs/debug.log"

  const logEntry = [
    `[${new Date().toISOString()}] ${label}`,
    inspect(data, {
      depth: 6,
      breakLength: 120,
      maxArrayLength: 100,
    }),
    "",
  ].join("\n")

  await appendFile(targetPath, logEntry, "utf8")

  return targetPath
}
