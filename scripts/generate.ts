import z from "zod"
import { mkdir, exists } from "node:fs/promises"
import path from "node:path"
import chalk from "chalk"
import { spawn } from "bun"

const TEMPLATE_DIR = path.join(import.meta.dir, "templates")

const templateDef = {
  command: ["command", "cmd", "c"],
  validator: ["validator", "val", "v"],
  middleware: ["middleware", "m"],
}

// used to validate the template name
const templateSchema = z.string().refine((name) => Object.values(templateDef).some((def) => def.includes(name)), {
  message: "Invalid struct name. Choose from: " + Object.values(templateDef).flat().join(", "),
})

// find and parse requested template
const [template, name] = process.argv.slice(2)
if (!template) {
  console.error(
    `Usage: bun g [template] [name]\n\nAvailable templates: ${Object.entries(templateDef)
      .map(([key, def]) => `${key} (${def.join(", ")})`)
      .join(", ")}`
  )
  process.exit(0)
}
const parsed = templateSchema.safeParse(template)
if (!parsed.success) {
  console.error(parsed.error.flatten().formErrors.at(0))
  process.exit(0)
}

const type = Object.entries(templateDef).find(([, def]) => def.includes(template))![0] as keyof typeof templateDef

if (!name) {
  console.error("No name provided.")
  process.exit(0)
}

switch (type) {
  case "command": {
    const [category, command] = name.split("/")
    if (!command) {
      console.error("Provide command name in format: category/command")
      process.exit(1)
    }
    console.log(`\nCreating command ${chalk.green(command)} in category ${chalk.green(category)}`)
    createCommand(category!, command)
    break
  }

  case "validator": {
    console.log(`\nCreating validator ${chalk.green(name)}`)
    createValidator(name)
    break
  }

  case "middleware": {
    console.log(`\nCreating middleware ${chalk.green(name)}`)
    createMiddleware(name)
    break
  }
}

async function createCommand(category: string, command: string) {
  const commandDir = `src/commands/${category}`
  await mkdir(commandDir, { recursive: true })
  writeTemplate("command", `${commandDir}/${command}.ts`)
}

async function createValidator(name: string) {
  const validatorDir = "src/validators"
  await mkdir(validatorDir, { recursive: true })
  writeTemplate("validator", `${validatorDir}/${name}.ts`)
}
async function createMiddleware(name: string) {
  const middlewareDir = "src/middlewares"
  await mkdir(middlewareDir, { recursive: true })
  writeTemplate("middleware", `${middlewareDir}/${name}.ts`)
}

async function writeTemplate(template: string, dest: string) {
  const src = path.join(TEMPLATE_DIR, `${template}.template.ts`)
  if (await exists(dest)) {
    console.error(`\nFile '${dest}' already exists.`)
    process.exit(1)
  }
  Bun.write(dest, Bun.file(src))
  console.log(" -> " + chalk.blue(chalk.underline(dest)))

  // Open generated file in current vscode instance
  if (isVsCodeTerminal()) spawn({ cmd: [getVsCodeBinary(), "-r", dest] })
}

function isVsCodeTerminal() {
  return process.env["TERM_PROGRAM"] == "vscode"
}

function getVsCodeBinary() {
  return (
    process.env["VSCODE_GIT_ASKPASS_NODE"] ??
    (process.env["TERM_PROGRAM_VERSION"]?.includes("insider") ? "code-insiders" : "code")
  )
}
