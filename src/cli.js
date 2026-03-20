#!/usr/bin/env node

import * as TK from "@gesslar/toolkit"

import {execFile} from "node:child_process"
import {promisify} from "node:util"

;(async() => {
  const exec = promisify(execFile)

  const cwd = new TK.DirectoryObject()
  const jsonFile = cwd.getFile("package.json")
  const pkg = await jsonFile.loadData()

  // Detect license file in project root
  const licenseFile = (await cwd.glob("{LICEN[CS]E,UNLICEN[CS]E}{,.txt,.md}"))?.files[0]

  const name = pkg.name ?? "this project"
  const license = pkg.license ?? "Unknown"

  const publicDomain = ["Unlicense", "0BSD", "CC0-1.0"]
  const phrase = publicDomain.includes(license)
    ? `\`${name}\` is released into the public domain under the`
    : `\`${name}\` is released under the`

  const lines = [
    "## License",
    "",
    `${phrase} [${license}](${licenseFile?.name ?? "LICENSE"}).`,
  ]

  const deps = Object.keys(pkg.dependencies ?? {}).sort()

  if(deps.length) {
    lines.push(
      "",
      "This package includes or depends on third-party components under their own",
      "licenses:",
      "",
      "| Dependency | License |",
      "| --- | --- |",
    )

    const results = await Promise.all(deps.map(dep => npmView(dep)))

    for(const {name: dep, license: depLicense, repo} of results) {
      const link = repo ? `[${dep}](${repo})` : dep
      lines.push(`| ${link} | ${depLicense} |`)
    }
  }

  TK.Glog(lines.join("\n"))

  async function npmView(dep) {
    try {
      const {stdout} = await exec(
        "npm", ["view", dep, "repository.url", "license", "--json"]
      )
      const data = JSON.parse(stdout)

      return {
        name: dep,
        license: data.license ?? "Unknown",
        repo: cleanUrl(data["repository.url"]),
      }
    } catch {
      return {name: dep, license: "Unknown", repo: null}
    }
  }

  function cleanUrl(raw) {
    if(!raw)
      return null

    return raw
      .replace(/^git\+/, "")
      .replace(/\.git$/, "")
      .replace(/^ssh:\/\/git@github\.com/, "https://github.com")
      .replace(/^git:\/\//, "https://")
  }
})()
