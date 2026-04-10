#!/usr/bin/env node

import * as TK from "@gesslar/toolkit"
import {buildLicenseSection, npmView} from "./lib.js"
import {fileURLToPath} from "node:url"

const PUBLIC_DOMAIN = ["Unlicense", "0BSD", "CC0-1.0", "MIT-0"]

/**
 * Generates structured license data for a project.
 *
 * @param {import("@gesslar/toolkit").FileObject} jsonFile - A FileObject
 *   pointing to the project's package.json.
 * @returns {Promise<{name: string|null, license: string|null,
 *   licenseFile: string|null, publicDomain: boolean,
 *   dependencies: Array<{name: string, license: string,
 *   repo: string|null}>}>} Structured license data.
 */
export async function licensed(jsonFile) {
  const pkg = await jsonFile.loadData()
  const cwd = jsonFile.parent

  const licenseFileObj =
    (await cwd.glob("{LICEN[CS]E,UNLICEN[CS]E}{,.txt,.md}"))?.files[0]

  const deps = Object.keys(pkg.dependencies ?? {}).sort()
  const depResults = deps.length
    ? await Promise.all(deps.map(dep => npmView(dep)))
    : []

  return {
    name: pkg.name ?? null,
    license: pkg.license ?? null,
    licenseFile: licenseFileObj?.name ?? null,
    publicDomain: PUBLIC_DOMAIN.includes(pkg.license),
    dependencies: depResults,
  }
}

export {buildLicenseSection, cleanUrl, npmView} from "./lib.js"

// CLI mode
if(process.argv[1] === fileURLToPath(import.meta.url)) {
  const cwd = new TK.DirectoryObject()
  const jsonFile = cwd.getFile("package.json")
  const data = await licensed(jsonFile)

  const output = buildLicenseSection({
    name: data.name,
    license: data.license,
    licenseFile: data.licenseFile,
    depResults: data.dependencies,
  })

  TK.Glog(output)
}
