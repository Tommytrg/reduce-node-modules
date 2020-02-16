import fs from 'fs'
import fsExtra from 'fs-extra'

// 1. store packages names, version and path of folder
// 2. check if node_modules of each package is repeated
// 2.1 if is repeated, copy package in cache folder and replace package with a symlink of the cache
// 2.2 if not, do 1 with its node_modules

type ModuleInfo = {
  name: string,
  version: string,
  path: string,
}

type ModuleCache = {
  [key: string]: ModuleInfo
}

export function main () {
  const items = readItemsFromPath('./node_modules')
  let currentPath = './node_modules'
  const moduleCache: ModuleCache = {}

  items.map((item: string) => {
    let localPath =`${currentPath}/${item}`
    if (isModuleFolder(localPath)) {
      let moduleInfo = getModuleInfo(localPath)
      if (moduleInfo) moduleCache[createModuleCacheEntryName(moduleInfo)] = moduleInfo
    }
  })
  console.log(moduleCache)
}

export function isModuleFolder(path: string) {
  return isFolder(path) && !!readPackageJsonFile(`${path}/package.json`)
}

export function isModuleRepeated(moduleInfo: ModuleInfo, moduleCacheEntry: string) : boolean {
  return createModuleCacheEntryName(moduleInfo) === moduleCacheEntry
}

export function createModuleCacheEntryName(moduleInfo: ModuleInfo): string {
  // TODO: Replace by hash(name-version)
  return `${moduleInfo.name}-${moduleInfo.version}`
}

export function getModuleInfo(path: string): ModuleInfo | false {
  const information = readPackageJsonFile(`${path}/package.json`)
  return information ? { name: information.name, version: information.version, path } : false
}

export function creatreSymlink (dest: string, from: string) {
  fs.symlinkSync(dest, from)
}

export function copyFolder (from: string, dest: string) {
  fsExtra.copySync(dest, from)
}

export function hasNodeModules (path: string): boolean {
  return readItemsFromPath(path).indexOf('node_modules') !== -1
}

function isFolder(path: string): boolean {
  return fs.lstatSync(path).isDirectory()
}

function readItemsFromPath(path: string): Array<string> {
  return fs.readdirSync(path)
}

function readPackageJsonFile (path: string): { name: string, version: string } | false {
  try{
    return JSON.parse(fs.readFileSync(path).toString())
  } catch(err) {
    console.log(`The given path: ${path} is not a valid path for a package.json`)
    return false
  }
}

main()