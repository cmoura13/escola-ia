import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(
  _request: NextRequest,
  { params }: { params: { file: string } }
) {
  if (!supabaseUrl || !supabaseKey) {
    return new Response('Not found', { status: 404 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data } = supabase.storage.from('course-covers').getPublicUrl(params.file)

  if (!data?.publicUrl) {
    return new Response('Not found', { status: 404 })
  }

  return NextResponse.redirect(data.publicUrl)
}
