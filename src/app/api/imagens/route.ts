import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  const imagensDir = path.join(process.cwd(), 'imagens')

  try {
    const files = fs.readdirSync(imagensDir)
    const images = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(file))
      .map(file => ({
        name: file,
        url: `/api/imagens/${encodeURIComponent(file)}`,
      }))

    return NextResponse.json({ images })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao ler diretório de imagens' }, { status: 500 })
  }
}
