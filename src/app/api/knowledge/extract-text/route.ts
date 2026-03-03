import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente Supabase para autenticação
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Processar arquivo
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    let text = ''

    if (ext === 'txt') {
      // Arquivo de texto simples
      text = await file.text()
    } else if (ext === 'pdf') {
      // PDF - usar pdf-parse via API externa ou processar localmente
      text = await extractTextFromPDF(file)
    } else if (ext === 'doc' || ext === 'docx') {
      // DOC/DOCX - usar mammoth ou similar
      text = await extractTextFromDoc(file)
    } else {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 })
    }

    return NextResponse.json({ text, filename: file.name })
  } catch (error) {
    console.error('Erro ao extrair texto:', error)
    return NextResponse.json(
      { error: 'Erro ao processar arquivo' },
      { status: 500 }
    )
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  // Opção 1: Usar uma API externa como CloudConvert, Zamzar, etc.
  // Opção 2: Processar localmente usando pdf-parse (requer node.js)
  
  // Por enquanto, vamos fazer upload temporário e processar
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  // Usar pdf-parse dinamicamente
  try {
    const pdfParse = await import('pdf-parse')
    // @ts-expect-error - pdf-parse has inconsistent exports
    const parse = pdfParse.default || pdfParse
    const data = await parse(buffer)
    return data.text
  } catch (error) {
    console.error('Erro ao processar PDF:', error)
    throw new Error('Falha ao extrair texto do PDF')
  }
}

async function extractTextFromDoc(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  
  try {
    // Usar mammoth para DOCX
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } catch (error) {
    console.error('Erro ao processar DOC:', error)
    throw new Error('Falha ao extrair texto do documento')
  }
}
