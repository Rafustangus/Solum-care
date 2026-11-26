import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourceRoot = path.join(root, 'src')
const patterns = [
  /\bfrom\s*['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\bimport\s*['"]([^'"]+)['"]/g
]
const extensions = ['', '.js', '.jsx', '/index.js', '/index.jsx']

function listFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return listFiles(fullPath)
    return /\.(js|jsx)$/.test(entry.name) ? [fullPath] : []
  })
}

function lineAt(content, index) {
  return content.slice(0, index).split('\n').length
}

function resolveSource(file, source) {
  const base = path.resolve(path.dirname(file), source)
  return extensions.map((extension) => `${base}${extension}`).some((candidate) => fs.existsSync(candidate))
}

const missing = []
const files = listFiles(sourceRoot)

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  const seen = new Set()

  for (const pattern of patterns) {
    for (const match of content.matchAll(pattern)) {
      const source = match[1].split(/[?#]/)[0]
      if (!source.startsWith('.')) continue
      const line = lineAt(content, match.index)
      const key = `${source}:${line}`
      if (seen.has(key)) continue
      seen.add(key)
      if (!resolveSource(file, source)) {
        missing.push({ file: path.relative(root, file), line, source })
      }
    }
  }
}

if (missing.length) {
  console.error('Imports rotos detectados:')
  for (const item of missing) {
    console.error(`- ${item.file}:${item.line} -> ${item.source}`)
  }
  process.exit(1)
}

console.log(`Imports comprobados: ${files.length} archivos.`)
