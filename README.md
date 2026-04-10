# @gesslar/licensed

A simple CLI tool that generates license documentation for Node.js projects. It
reads your `package.json`, finds your license file, and outputs a formatted
markdown section listing your project license and all dependency licenses.

## Installation

```bash
npm install -g @gesslar/licensed
```

Or as a dev dependency:

```bash
npm install --save-dev @gesslar/licensed
```

## Usage

Run from your project directory:

```bash
npx @gesslar/licensed
```

The tool outputs markdown to stdout that you can add to your README. The output
includes:

- Your project's license with a link to the license file
- A table of all dependencies with their licenses and repository links

## Requirements

- Node.js v24.13.0 or higher

## License

`@gesslar/licensed` is released into the public domain under the [0BSD](LICENSE.txt).

This package includes or depends on third-party components under their own
licenses:

| Dependency | License |
| --- | --- |
| [@gesslar/toolkit](https://github.com/gesslar/toolkit) | 0BSD |
