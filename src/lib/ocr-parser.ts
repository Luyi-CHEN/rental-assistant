import Tesseract from 'tesseract.js'
import { detectPlatform, extractPropertyInfo } from './url-parser'
import type { ParsedLink } from './url-parser'

export interface OcrProgress {
  status: 'loading' | 'recognizing' | 'done' | 'error'
  progress: number // 0-1
  message: string
}

export interface OcrResult {
  rawText: string
  parsed: ParsedLink
}

export async function recognizeImage(
  imageSource: File | string,
  onProgress?: (progress: OcrProgress) => void,
): Promise<OcrResult> {
  onProgress?.({ status: 'loading', progress: 0, message: '加载识别引擎...' })

  const worker = await Tesseract.createWorker('chi_sim+eng', undefined, {
    logger: (m) => {
      if (m.status === 'loading tesseract core') {
        onProgress?.({ status: 'loading', progress: 0.1, message: '加载识别引擎...' })
      } else if (m.status === 'initializing tesseract') {
        onProgress?.({ status: 'loading', progress: 0.2, message: '初始化引擎...' })
      } else if (m.status === 'loading language traineddata') {
        onProgress?.({ status: 'loading', progress: 0.15 + (m.progress ?? 0) * 0.35, message: '加载中文语言包...' })
      } else if (m.status === 'initializing api') {
        onProgress?.({ status: 'loading', progress: 0.55, message: '准备就绪...' })
      } else if (m.status === 'recognizing text') {
        onProgress?.({ status: 'recognizing', progress: 0.6 + (m.progress ?? 0) * 0.35, message: '识别文字中...' })
      }
    },
  })

  try {
    onProgress?.({ status: 'recognizing', progress: 0.6, message: '识别文字中...' })
    const { data } = await worker.recognize(imageSource)
    const rawText = data.text

    onProgress?.({ status: 'done', progress: 1, message: '识别完成' })

    const parsed = parseOcrText(rawText)

    return { rawText, parsed }
  } finally {
    await worker.terminate()
  }
}

function parseOcrText(text: string): ParsedLink {
  const platform = detectPlatform(text)
  const result: ParsedLink = {
    platform,
    sourceUrl: '',
  }

  // OCR text often has messy line breaks - normalize
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')

  extractPropertyInfo(normalizedText, result)

  // If name wasn't found by standard extraction, try OCR-specific heuristics
  if (!result.name) {
    const lines = normalizedText.split('\n').map(l => l.trim()).filter(Boolean)

    // In rental app screenshots, the property name is usually one of the first
    // prominent lines: 2-15 Chinese chars, no numbers/special keywords
    for (const line of lines.slice(0, 8)) {
      const cleaned = line.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
      if (
        cleaned.length >= 2 && cleaned.length <= 20
        && /[\u4e00-\u9fa5]{2,}/.test(cleaned)
        && !/\d{3,}/.test(cleaned)
        && !/^(整租|合租|月租|租金|价格|面积|楼层|朝向|户型|小区|地址|链家|贝壳|自如|安居客|我爱我家)/.test(cleaned)
        && !/元/.test(line)
        && !/㎡|平米|平方/.test(line)
        && !/室.*厅/.test(line)
      ) {
        result.name = cleaned
        break
      }
    }
  }

  return result
}
