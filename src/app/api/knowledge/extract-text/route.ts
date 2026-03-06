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
    console.log('[API extract-text] Arquivo:', file.name, 'extensão:', ext, 'tipo:', file.type)
    let text = ''

    if (ext === 'txt' || ext === 'md') {
      // Arquivos de texto simples (incluindo Markdown)
      console.log('[API extract-text] Processando como texto simples')
      text = await file.text()
    } else if (ext === 'pdf') {
      // PDF - usar pdf2json
      console.log('[API extract-text] Processando PDF com pdf2json...')
      text = await extractTextFromPDF(file)
    } else if (ext === 'doc' || ext === 'docx') {
      // DOC/DOCX - usar mammoth
      console.log('[API extract-text] Processando DOC/DOCX...')
      text = await extractTextFromDoc(file)
    } else {
      return NextResponse.json({ error: 'Tipo de arquivo não suportado' }, { status: 400 })
    }

    console.log('[API extract-text] Sucesso:', file.name, '-', text.length, 'caracteres extraídos')
    return NextResponse.json({ text, filename: file.name })
  } catch (error) {
    console.error('[API extract-text] Erro detalhado:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Função segura para decodificar texto (tenta decodeURIComponent, se falhar retorna original)
function safeDecode(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    // Se falhar, tenta converter de UTF-8 escape sequences
    try {
      return text.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      )
    } catch {
      return text
    }
  }
}

async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Usar pdf2json
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFParser = require('pdf2json')
    
    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1)
      
      pdfParser.on('pdfParser_dataError', (errData: { parserError: Error }) => {
        console.error('[API extract-text] PDF parse error:', errData.parserError)
        reject(new Error('Falha ao processar PDF'))
      })
      
      pdfParser.on('pdfParser_dataReady', (pdfData: { Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }> }) => {
        try {
          let text = ''
          
          // Extrair texto de todas as páginas
          for (const page of pdfData.Pages) {
            for (const textItem of page.Texts) {
              for (const r of textItem.R) {
                // Tentar decodificar, mas usar valor original se falhar
                const decodedText = safeDecode(r.T)
                text += decodedText + ' '
              }
            }
            text += '\n\n'
          }
          
          resolve(text.trim())
        } catch (err) {
          reject(err)
        }
      })
      
      pdfParser.parseBuffer(buffer)
    })
  } catch (error) {
    console.error('[API extract-text] Erro ao processar PDF:', error)
    throw new Error('Falha ao extrair texto do PDF. Verifique se o arquivo não está corrompido.')
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
    console.error('[API extract-text] Erro ao processar DOC:', error)
    throw new Error('Falha ao extrair texto do documento')
  }
}
