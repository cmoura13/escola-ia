import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ images: [] })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data, error } = await supabase.storage.from('course-covers').list()

  if (error) {
    return NextResponse.json({ images: [] })
  }

  const images = (data || [])
    .filter(f => /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(f.name))
    .map(f => ({
      name: f.name,
      url: supabase.storage.from('course-covers').getPublicUrl(f.name).data.publicUrl,
    }))

  return NextResponse.json({ images })
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { data, error } = await supabase.storage
      .from('course-covers')
      .upload(file.name, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('course-covers')
      .getPublicUrl(file.name)

    return NextResponse.json({ name: file.name, url: urlData.publicUrl })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
