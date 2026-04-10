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
export function licensed(jsonFile: import("@gesslar/toolkit").FileObject): Promise<{
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
export { buildLicenseSection, cleanUrl, npmView } from "./lib.js";
//# sourceMappingURL=index.d.ts.map