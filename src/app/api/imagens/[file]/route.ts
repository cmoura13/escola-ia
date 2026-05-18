import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  _request: NextRequest,
  { params }: { params: { file: string } }
) {
  const imagensDir = path.resolve(process.cwd(), 'imagens')
  const filePath = path.resolve(imagensDir, params.file)

  if (!filePath.startsWith(imagensDir)) {
    return new Response('Not found', { status: 404 })
  }

  try {
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).toLowerCase()
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.bmp': 'image/bmp',
    }
    const contentType = contentTypeMap[ext] || 'application/octet-stream'

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
