/**
 * Cleans a repository URL to a normalized HTTPS form.
 *
 * @param {string|null|undefined} raw - The raw repository URL.
 * @returns {string|null} The cleaned URL or null.
 */
export function cleanUrl(raw: string | null | undefined): string | null;
/**
 * Queries npm registry for a dependency's license and repository URL.
 *
 * @param {string} dep - The dependency name.
 * @returns {Promise<{name: string, license: string, repo: string|null}>}
 *   The dependency info.
 */
export function npmView(dep: string): Promise<{
    name: string;
    license: string;
    repo: string | null;
}>;
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
export function buildLicenseSection({ name, license, licenseFile, depResults }: {
    name: string | undefined;
    license: string | undefined;
    licenseFile: string | undefined;
    depResults: Array<{
        name: string;
        license: string;
        repo: string | null;
    }>;
}): string;
/**
 * Generates structured license data for a project.
 *
 * @param {TK.FileObject} jsonFile - A FileObject pointing to the project's
 *   package.json.
 * @returns {Promise<{name: string|null, license: string|null,
 *   licenseFile: string|null, publicDomain: boolean,
 *   dependencies: Array<{name: string, license: string,
 *   repo: string|null}>}>} Structured license data.
 */
export function licensed(jsonFile: TK.FileObject): Promise<{
    name: string | null;
    license: string | null;
    licenseFile: string | null;
    publicDomain: boolean;
    dependencies: Array<{
        name: string;
        license: string;
        repo: string | null;
    }>;
}>;
import * as TK from "@gesslar/toolkit";
//# sourceMappingURL=lib.d.ts.map