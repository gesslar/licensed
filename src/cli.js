#!/usr/bin/env node

import * as TK from "@gesslar/toolkit"
import {buildLicenseSection, licensed} from "./lib.js"

const cwd = new TK.DirectoryObject(TK.FileSystem.cwd)
const jsonFile = cwd.getFile("package.json")
const data = await licensed(jsonFile)

const output = buildLicenseSection({
  name: data.name,
  license: data.license,
  licenseFile: data.licenseFile,
  depResults: data.dependencies,
})

TK.Glog(output)
