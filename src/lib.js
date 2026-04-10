import {execFile} from "node:child_process"
import {promisify} from "node:util"

const exec = promisify(execFile)

export const PUBLIC_DOMAIN = ["Unlicense", "0BSD", "CC0-1.0", "MIT-0"]

/**
 * Cleans a repository URL to a normalized HTTPS form.
 *
 * @param {string|null|undefined} raw - The raw repository URL.
 * @returns {string|null} The cleaned URL or null.
 */
export function cleanUrl(raw) {
  if(!raw)
    return null

  return raw
    .replace(/^git\+/, "")
    .replace(/\.git$/, "")
    .replace(/^ssh:\/\/git@github\.com/, "https://github.com")
    .replace(/^git:\/\//, "https://")
}

/**
 * Queries npm registry for a dependency's license and repository URL.
 *
 * @param {string} dep - The dependency name.
 * @returns {Promise<{name: string, license: string, repo: string|null}>}
 *   The dependency info.
 */
export async function npmView(dep) {
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

/**
 * Builds the markdown license section lines.
 *
 * @param {object} options - The options.
 * @param {string|undefined} options.name - Package name.
 * @param {string|undefined} options.license - Package license identifier.
 * @param {string|undefined} options.licenseFile - License file name.
 * @param {Array<{name: string, license: string, repo: string|null}>}
 *   options.depResults - Dependency info results.
 * @returns {string} The formatted markdown string.
 */
export function buildLicenseSection({name, license, licenseFile, depResults}) {
  const projName = name ?? "this project"
  const projLicense = license ?? "Unknown"

  const phrase = PUBLIC_DOMAIN.includes(projLicense)
    ? `\`${projName}\` is released into the public domain under the`
    : `\`${projName}\` is released under the`

  const lines = [
    "## License",
    "",
    `${phrase} [${projLicense}](${licenseFile ?? "LICENSE"}).`,
  ]

  if(depResults?.length) {
    lines.push(
      "",
      "This package includes or depends on third-party components under their own",
      "licenses:",
      "",
      "| Dependency | License |",
      "| --- | --- |",
    )

    for(const {name: dep, license: depLicense, repo} of depResults) {
      const link = repo ? `[${dep}](${repo})` : dep
      lines.push(`| ${link} | ${depLicense} |`)
    }
  }

  return lines.join("\n")
}
