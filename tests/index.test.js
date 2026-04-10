import {describe, it, before, after} from "node:test"
import assert from "node:assert/strict"
import {writeFile, mkdir, rm} from "node:fs/promises"
import {join} from "node:path"
import {tmpdir} from "node:os"
import {licensed} from "../src/lib.js"
import * as TK from "@gesslar/toolkit"

describe("licensed", () => {
  let tempDir
  let tempDirObj

  before(async() => {
    tempDir = join(tmpdir(), `licensed-test-${Date.now()}`)
    await mkdir(tempDir, {recursive: true})
  })

  after(async() => {
    await rm(tempDir, {recursive: true, force: true})
  })

  async function setupFixture(pkgData, licenseFileName) {
    // Clean prior fixture files
    const dir = join(tempDir, `fixture-${Date.now()}`)
    await mkdir(dir, {recursive: true})

    await writeFile(
      join(dir, "package.json"),
      JSON.stringify(pkgData, null, 2)
    )

    if(licenseFileName) {
      await writeFile(join(dir, licenseFileName), "License text here")
    }

    tempDirObj = new TK.DirectoryObject(dir)
    return tempDirObj.getFile("package.json")
  }

  describe("return shape", () => {
    it("returns an object with expected keys", async() => {
      const jsonFile = await setupFixture({
        name: "test-pkg",
        license: "MIT",
      })
      const result = await licensed(jsonFile)

      assert.ok("name" in result)
      assert.ok("license" in result)
      assert.ok("licenseFile" in result)
      assert.ok("publicDomain" in result)
      assert.ok("dependencies" in result)
    })
  })

  describe("name field", () => {
    it("returns package name from package.json", async() => {
      const jsonFile = await setupFixture({name: "my-app", license: "MIT"})
      const result = await licensed(jsonFile)
      assert.equal(result.name, "my-app")
    })

    it("returns scoped package name", async() => {
      const jsonFile = await setupFixture({name: "@scope/pkg", license: "MIT"})
      const result = await licensed(jsonFile)
      assert.equal(result.name, "@scope/pkg")
    })

    it("returns null when name is missing", async() => {
      const jsonFile = await setupFixture({license: "MIT"})
      const result = await licensed(jsonFile)
      assert.equal(result.name, null)
    })
  })

  describe("license field", () => {
    it("returns license from package.json", async() => {
      const jsonFile = await setupFixture({name: "x", license: "Apache-2.0"})
      const result = await licensed(jsonFile)
      assert.equal(result.license, "Apache-2.0")
    })

    it("returns null when license is missing", async() => {
      const jsonFile = await setupFixture({name: "x"})
      const result = await licensed(jsonFile)
      assert.equal(result.license, null)
    })
  })

  describe("publicDomain field", () => {
    for(const lic of ["Unlicense", "0BSD", "CC0-1.0", "MIT-0"]) {
      it(`returns true for ${lic}`, async() => {
        const jsonFile = await setupFixture({name: "x", license: lic})
        const result = await licensed(jsonFile)
        assert.equal(result.publicDomain, true)
      })
    }

    for(const lic of ["MIT", "Apache-2.0", "GPL-3.0", "ISC"]) {
      it(`returns false for ${lic}`, async() => {
        const jsonFile = await setupFixture({name: "x", license: lic})
        const result = await licensed(jsonFile)
        assert.equal(result.publicDomain, false)
      })
    }

    it("returns false when license is missing", async() => {
      const jsonFile = await setupFixture({name: "x"})
      const result = await licensed(jsonFile)
      assert.equal(result.publicDomain, false)
    })
  })

  describe("licenseFile field", () => {
    it("detects LICENSE.txt", async() => {
      const jsonFile = await setupFixture(
        {name: "x", license: "MIT"}, "LICENSE.txt"
      )
      const result = await licensed(jsonFile)
      assert.equal(result.licenseFile, "LICENSE.txt")
    })

    it("detects LICENSE.md", async() => {
      const jsonFile = await setupFixture(
        {name: "x", license: "MIT"}, "LICENSE.md"
      )
      const result = await licensed(jsonFile)
      assert.equal(result.licenseFile, "LICENSE.md")
    })

    it("detects LICENSE without extension", async() => {
      const jsonFile = await setupFixture(
        {name: "x", license: "MIT"}, "LICENSE"
      )
      const result = await licensed(jsonFile)
      assert.equal(result.licenseFile, "LICENSE")
    })

    it("detects LICENCE spelling", async() => {
      const jsonFile = await setupFixture(
        {name: "x", license: "MIT"}, "LICENCE"
      )
      const result = await licensed(jsonFile)
      assert.equal(result.licenseFile, "LICENCE")
    })

    it("detects UNLICENSE.txt", async() => {
      const jsonFile = await setupFixture(
        {name: "x", license: "Unlicense"}, "UNLICENSE.txt"
      )
      const result = await licensed(jsonFile)
      assert.equal(result.licenseFile, "UNLICENSE.txt")
    })

    it("returns null when no license file exists", async() => {
      const jsonFile = await setupFixture({name: "x", license: "MIT"})
      const result = await licensed(jsonFile)
      assert.equal(result.licenseFile, null)
    })
  })

  describe("dependencies field", () => {
    it("returns empty array when no dependencies", async() => {
      const jsonFile = await setupFixture({name: "x", license: "MIT"})
      const result = await licensed(jsonFile)
      assert.deepEqual(result.dependencies, [])
    })

    it("returns empty array when dependencies key is missing", async() => {
      const jsonFile = await setupFixture({name: "x", license: "MIT"})
      const result = await licensed(jsonFile)
      assert.ok(Array.isArray(result.dependencies))
      assert.equal(result.dependencies.length, 0)
    })

    it("returns sorted dependency results for real packages", async() => {
      const jsonFile = await setupFixture({
        name: "x",
        license: "MIT",
        dependencies: {
          "json5": "^2.0.0",
          "yaml": "^2.0.0",
        },
      })
      const result = await licensed(jsonFile)

      assert.equal(result.dependencies.length, 2)
      assert.equal(result.dependencies[0].name, "json5")
      assert.equal(result.dependencies[1].name, "yaml")

      // Each should have name, license, repo
      for(const dep of result.dependencies) {
        assert.ok("name" in dep)
        assert.ok("license" in dep)
        assert.ok("repo" in dep)
        assert.ok(typeof dep.license === "string")
      }
    })

    it("returns Unknown license for nonexistent packages", async() => {
      const jsonFile = await setupFixture({
        name: "x",
        license: "MIT",
        dependencies: {
          "this-package-definitely-does-not-exist-xyz-123": "^1.0.0",
        },
      })
      const result = await licensed(jsonFile)

      assert.equal(result.dependencies.length, 1)
      assert.equal(result.dependencies[0].license, "Unknown")
      assert.equal(result.dependencies[0].repo, null)
    })
  })
})
