# @gesslar/licensed

A simple CLI and API for generating license documentation for Node.js projects.
It reads your `package.json`, finds your license file, and outputs formatted
markdown or structured JSON listing your project license and all dependency
licenses.

## Installation

```bash
npm install -g @gesslar/licensed
```

Or as a dev dependency:

```bash
npm install --save-dev @gesslar/licensed
```

## CLI Usage

Run from your project directory:

```bash
npx @gesslar/licensed
```

The tool outputs markdown to stdout that you can add to your README. The output
includes:

- Your project's license with a link to the license file
- A table of all dependencies with their licenses and repository links

## API Usage

You can also use `licensed` programmatically. Pass a
[`FileObject`](https://github.com/gesslar/toolkit) pointing to a project's
`package.json` and get back structured JSON.

```js
import {licensed} from "@gesslar/licensed"
import {DirectoryObject} from "@gesslar/toolkit"

const cwd = new DirectoryObject("/path/to/project")
const jsonFile = cwd.getFile("package.json")
const data = await licensed(jsonFile)
```

The returned object has the following shape:

```js
{
  name: "my-package",        // package name, or null
  license: "MIT",            // SPDX license identifier, or null
  licenseFile: "LICENSE.txt", // detected license filename, or null
  publicDomain: false,       // true for Unlicense, 0BSD, CC0-1.0, MIT-0
  dependencies: [
    { name: "lodash", license: "MIT", repo: "https://github.com/lodash/lodash" },
    { name: "private-pkg", license: "Unknown", repo: null },
  ]
}
```

### Generating Markdown from the API

Use `buildLicenseSection` to turn the data into the same markdown the CLI
produces:

```js
import {licensed, buildLicenseSection} from "@gesslar/licensed"

const data = await licensed(jsonFile)
const markdown = buildLicenseSection({
  name: data.name,
  license: data.license,
  licenseFile: data.licenseFile,
  depResults: data.dependencies,
})
```

### Other Exports

- `cleanUrl(raw)` - Normalizes repository URLs (strips `git+`, `.git`,
  converts SSH/git protocols to HTTPS)
- `npmView(dep)` - Queries the npm registry for a package's license and
  repository URL
- `buildLicenseSection(options)` - Generates a markdown license section from
  structured data

## Requirements

- Node.js v24.13.0 or higher

## License

`@gesslar/licensed` is released under the [0BSD](LICENSE.txt).

This package includes or depends on third-party components under their own
licenses:

| Dependency | License |
| --- | --- |
| [@gesslar/toolkit](https://github.com/gesslar/toolkit) | 0BSD |
