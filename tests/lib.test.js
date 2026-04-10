import {describe, it} from "node:test"
import assert from "node:assert/strict"
import {cleanUrl, buildLicenseSection} from "../src/lib.js"

describe("cleanUrl", () => {
  it("returns null for null input", () => {
    assert.equal(cleanUrl(null), null)
  })

  it("returns null for undefined input", () => {
    assert.equal(cleanUrl(undefined), null)
  })

  it("returns null for empty string", () => {
    assert.equal(cleanUrl(""), null)
  })

  it("strips git+ prefix", () => {
    assert.equal(
      cleanUrl("git+https://github.com/user/repo"),
      "https://github.com/user/repo"
    )
  })

  it("strips .git suffix", () => {
    assert.equal(
      cleanUrl("https://github.com/user/repo.git"),
      "https://github.com/user/repo"
    )
  })

  it("strips both git+ prefix and .git suffix", () => {
    assert.equal(
      cleanUrl("git+https://github.com/user/repo.git"),
      "https://github.com/user/repo"
    )
  })

  it("converts ssh://git@github.com to https://github.com", () => {
    assert.equal(
      cleanUrl("ssh://git@github.com/user/repo"),
      "https://github.com/user/repo"
    )
  })

  it("converts ssh URL with .git suffix", () => {
    assert.equal(
      cleanUrl("ssh://git@github.com/user/repo.git"),
      "https://github.com/user/repo"
    )
  })

  it("converts git:// protocol to https://", () => {
    assert.equal(
      cleanUrl("git://github.com/user/repo"),
      "https://github.com/user/repo"
    )
  })

  it("converts git:// protocol with .git suffix", () => {
    assert.equal(
      cleanUrl("git://github.com/user/repo.git"),
      "https://github.com/user/repo"
    )
  })

  it("returns plain https URL unchanged", () => {
    assert.equal(
      cleanUrl("https://github.com/user/repo"),
      "https://github.com/user/repo"
    )
  })

  it("handles non-GitHub URLs", () => {
    assert.equal(
      cleanUrl("git+https://gitlab.com/user/repo.git"),
      "https://gitlab.com/user/repo"
    )
  })

  it("does not strip .git from middle of URL", () => {
    assert.equal(
      cleanUrl("https://github.com/user/repo.github.io"),
      "https://github.com/user/repo.github.io"
    )
  })

  it("handles git:// with non-GitHub host", () => {
    assert.equal(
      cleanUrl("git://bitbucket.org/user/repo.git"),
      "https://bitbucket.org/user/repo"
    )
  })
})

describe("buildLicenseSection", () => {
  describe("header and license phrase", () => {
    it("starts with ## License heading", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [],
      })
      assert.ok(result.startsWith("## License"))
    })

    it("uses standard phrase for non-public-domain licenses", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [],
      })
      assert.ok(result.includes("`my-pkg` is released under the [MIT]"))
    })

    it("uses public domain phrase for Unlicense", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "Unlicense",
        depResults: [],
      })
      assert.ok(
        result.includes("`my-pkg` is released into the public domain under the [Unlicense]")
      )
    })

    it("uses standard phrase for 0BSD", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "0BSD",
        depResults: [],
      })
      assert.ok(result.includes("`my-pkg` is released under the [0BSD]"))
      assert.ok(!result.includes("public domain"))
    })

    it("uses public domain phrase for CC0-1.0", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "CC0-1.0",
        depResults: [],
      })
      assert.ok(result.includes("released into the public domain"))
    })

    it("uses standard phrase for MIT-0", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT-0",
        depResults: [],
      })
      assert.ok(result.includes("`my-pkg` is released under the [MIT-0]"))
      assert.ok(!result.includes("public domain"))
    })

    it("uses standard phrase for Apache-2.0", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "Apache-2.0",
        depResults: [],
      })
      assert.ok(result.includes("`my-pkg` is released under the [Apache-2.0]"))
      assert.ok(!result.includes("public domain"))
    })

    it("uses standard phrase for GPL-3.0", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "GPL-3.0",
        depResults: [],
      })
      assert.ok(!result.includes("public domain"))
    })
  })

  describe("fallback values", () => {
    it("defaults name to 'this project' when undefined", () => {
      const result = buildLicenseSection({
        license: "MIT",
        depResults: [],
      })
      assert.ok(result.includes("`this project` is released under the"))
    })

    it("defaults license to 'Unknown' when undefined", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        depResults: [],
      })
      assert.ok(result.includes("[Unknown](LICENSE)"))
    })

    it("defaults licenseFile to 'LICENSE' when undefined", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [],
      })
      assert.ok(result.includes("[MIT](LICENSE)"))
    })

    it("uses provided licenseFile name", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        licenseFile: "LICENSE.md",
        depResults: [],
      })
      assert.ok(result.includes("[MIT](LICENSE.md)"))
    })

    it("handles UNLICENSE.txt file name", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "Unlicense",
        licenseFile: "UNLICENSE.txt",
        depResults: [],
      })
      assert.ok(result.includes("[Unlicense](UNLICENSE.txt)"))
    })
  })

  describe("no dependencies", () => {
    it("does not include dependency table when depResults is empty", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [],
      })
      assert.ok(!result.includes("| Dependency |"))
      assert.ok(!result.includes("third-party"))
    })

    it("does not include dependency table when depResults is undefined", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
      })
      assert.ok(!result.includes("| Dependency |"))
    })

    it("does not include dependency table when depResults is null", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: null,
      })
      assert.ok(!result.includes("| Dependency |"))
    })
  })

  describe("with dependencies", () => {
    it("includes dependency table header", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [
          {name: "lodash", license: "MIT", repo: "https://github.com/lodash/lodash"},
        ],
      })
      assert.ok(result.includes("| Dependency | License |"))
      assert.ok(result.includes("| --- | --- |"))
    })

    it("includes third-party notice text", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [
          {name: "lodash", license: "MIT", repo: null},
        ],
      })
      assert.ok(result.includes("third-party components under their own"))
      assert.ok(result.includes("licenses:"))
    })

    it("renders dependency with repo as a link", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [
          {name: "lodash", license: "MIT", repo: "https://github.com/lodash/lodash"},
        ],
      })
      assert.ok(result.includes("| [lodash](https://github.com/lodash/lodash) | MIT |"))
    })

    it("renders dependency without repo as plain text", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [
          {name: "some-pkg", license: "ISC", repo: null},
        ],
      })
      assert.ok(result.includes("| some-pkg | ISC |"))
    })

    it("renders multiple dependencies", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [
          {name: "alpha", license: "MIT", repo: "https://github.com/a/alpha"},
          {name: "beta", license: "Apache-2.0", repo: null},
          {name: "gamma", license: "ISC", repo: "https://github.com/g/gamma"},
        ],
      })
      assert.ok(result.includes("| [alpha](https://github.com/a/alpha) | MIT |"))
      assert.ok(result.includes("| beta | Apache-2.0 |"))
      assert.ok(result.includes("| [gamma](https://github.com/g/gamma) | ISC |"))
    })

    it("handles dependency with Unknown license", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [
          {name: "mystery", license: "Unknown", repo: null},
        ],
      })
      assert.ok(result.includes("| mystery | Unknown |"))
    })

    it("handles scoped package names", () => {
      const result = buildLicenseSection({
        name: "my-pkg",
        license: "MIT",
        depResults: [
          {name: "@scope/pkg", license: "MIT", repo: "https://github.com/scope/pkg"},
        ],
      })
      assert.ok(result.includes("| [@scope/pkg](https://github.com/scope/pkg) | MIT |"))
    })
  })

  describe("full output structure", () => {
    it("produces correct complete output with deps", () => {
      const result = buildLicenseSection({
        name: "my-app",
        license: "MIT",
        licenseFile: "LICENSE.txt",
        depResults: [
          {name: "express", license: "MIT", repo: "https://github.com/expressjs/express"},
        ],
      })

      const expected = [
        "## License",
        "",
        "`my-app` is released under the [MIT](LICENSE.txt).",
        "",
        "This package includes or depends on third-party components under their own",
        "licenses:",
        "",
        "| Dependency | License |",
        "| --- | --- |",
        "| [express](https://github.com/expressjs/express) | MIT |",
      ].join("\n")

      assert.equal(result, expected)
    })

    it("produces correct complete output without deps", () => {
      const result = buildLicenseSection({
        name: "my-app",
        license: "0BSD",
        licenseFile: "LICENSE",
        depResults: [],
      })

      const expected = [
        "## License",
        "",
        "`my-app` is released under the [0BSD](LICENSE).",
      ].join("\n")

      assert.equal(result, expected)
    })
  })
})
