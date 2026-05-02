import type { HousePlatform } from '@/types/house'

export interface ParsedLink {
  platform: HousePlatform
  sourceUrl: string
  name?: string
  rent?: number
  area?: number
  layout?: string
  floor?: string
  orientation?: string
}

// Standard HTTP URL platform patterns
const URL_PLATFORM_PATTERNS: { pattern: RegExp; platform: HousePlatform }[] = [
  { pattern: /lianjia\.com/i, platform: 'lianjia' },
  { pattern: /ke\.com/i, platform: 'beike' },
  { pattern: /ziroom\.com/i, platform: 'ziroom' },
  { pattern: /anjuke\.com/i, platform: 'anjuke' },
  { pattern: /xiaohongshu\.com|xhslink\.com/i, platform: 'xiaohongshu' },
  { pattern: /5i5j\.com|woaiwojia/i, platform: 'woaiwojia' },
  { pattern: /douban\.com/i, platform: 'douban' },
]

// WeChat mini-program name -> platform mapping
const MINI_PROGRAM_NAMES: { pattern: RegExp; platform: HousePlatform }[] = [
  { pattern: /链家/i, platform: 'lianjia' },
  { pattern: /贝壳找房|贝壳/i, platform: 'beike' },
  { pattern: /自如/i, platform: 'ziroom' },
  { pattern: /安居客/i, platform: 'anjuke' },
  { pattern: /我爱我家/i, platform: 'woaiwojia' },
  { pattern: /小红书/i, platform: 'xiaohongshu' },
  { pattern: /豆瓣/i, platform: 'douban' },
]

export function detectPlatform(text: string): HousePlatform {
  // Check URL patterns
  for (const { pattern, platform } of URL_PLATFORM_PATTERNS) {
    if (pattern.test(text)) return platform
  }
  // Check mini-program name patterns
  for (const { pattern, platform } of MINI_PROGRAM_NAMES) {
    if (pattern.test(text)) return platform
  }
  return 'other'
}

export function isValidUrl(text: string): boolean {
  try {
    const url = new URL(text.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Check if text contains a WeChat mini-program link
// Format: #小程序://AppName/path  or  「AppName」some text
function parseMiniProgramLink(text: string): ParsedLink | null {
  // Match: #小程序://AppName/code
  const miniMatch = text.match(/#小程序:\/\/([^/\s]+)\/(\S+)/)
  if (miniMatch) {
    const appName = miniMatch[1]
    const fullLink = miniMatch[0]
    const platform = detectPlatform(appName)
    return {
      platform,
      sourceUrl: fullLink,
      name: undefined, // mini-program links don't typically contain property details
    }
  }

  // Match WeChat share card text: 「AppName」description
  const cardMatch = text.match(/「([^」]+)」/)
  if (cardMatch) {
    const appName = cardMatch[1]
    const platform = detectPlatform(appName)
    if (platform !== 'other') {
      return {
        platform,
        sourceUrl: text.trim(),
      }
    }
  }

  return null
}

export function parseShareText(text: string): ParsedLink | null {
  // 1. Try standard HTTP URL first
  const urlMatch = text.match(/(https?:\/\/[^\s]+)/i)
  if (urlMatch) {
    const sourceUrl = urlMatch[1]
    const platform = detectPlatform(sourceUrl)
    const result: ParsedLink = { platform, sourceUrl }
    extractPropertyInfo(text, result)
    return result
  }

  // 2. Try WeChat mini-program link format
  const miniResult = parseMiniProgramLink(text)
  if (miniResult) {
    extractPropertyInfo(text, miniResult)
    return miniResult
  }

  // 3. Try to detect platform from text even without a URL
  // (e.g. plain text with platform name like "链家 xxx小区 3500元/月")
  const platform = detectPlatform(text)
  if (platform !== 'other') {
    const result: ParsedLink = { platform, sourceUrl: text.trim() }
    extractPropertyInfo(text, result)
    return result
  }

  return null
}

// Extract property info (price, area, layout, name, floor, orientation) from text
// Exported for reuse by OCR parser
export function extractPropertyInfo(text: string, result: ParsedLink): void {
  // Try to extract price (rent)
  const priceMatch = text.match(/(\d{3,5})\s*元?\s*[\/每]\s*月/i)
    || text.match(/月租[：:]\s*(\d{3,5})/)
    || text.match(/¥\s*(\d[\d,]{2,5})/)
    || text.match(/租金[：:]?\s*(\d{3,5})/)
    || text.match(/(\d{3,5})\s*元\s*\/月/)
  if (priceMatch) {
    result.rent = parseInt(priceMatch[1].replace(/,/g, ''), 10)
  }

  // Try to extract area
  const areaMatch = text.match(/(\d{2,4}(?:\.\d+)?)\s*㎡/)
    || text.match(/(\d{2,4}(?:\.\d+)?)\s*平[米方]?/)
    || text.match(/建[筑面][：:]?\s*(\d{2,4}(?:\.\d+)?)/)
  if (areaMatch) {
    result.area = parseFloat(areaMatch[1])
  }

  // Try to extract layout
  const layoutMatch = text.match(/(\d)\s*室\s*(\d)\s*厅/)
    || text.match(/(\d)\s*房\s*(\d)\s*厅/)
  if (layoutMatch) {
    result.layout = `${layoutMatch[1]}室${layoutMatch[2]}厅`
  } else {
    const cnLayoutMatch = text.match(/(一|二|三|四|五|1|2|3|4|5)\s*居室/)
    if (cnLayoutMatch) {
      const cnNum: Record<string, string> = { '一': '1', '二': '2', '三': '3', '四': '4', '五': '5' }
      const num = cnNum[cnLayoutMatch[1]] || cnLayoutMatch[1]
      result.layout = `${num}室`
    }
  }

  // Try to extract floor
  if (!result.floor) {
    const floorMatch = text.match(/(\d{1,2})\s*[\/]\s*(\d{1,3})\s*层/)
      || text.match(/(低|中|高)楼层[\/]?\s*(\d{1,3})层/)
      || text.match(/(低|中|高)\s*楼层/)
    if (floorMatch) {
      result.floor = floorMatch[0]
    }
  }

  // Try to extract orientation
  if (!result.orientation) {
    const orientMatch = text.match(/朝(南|北|东|西|南北|东南|东北|西南|西北)/)
      || text.match(/(南|北|东|西|南北|东南|东北|西南|西北)\s*向/)
      || text.match(/(南北通透)/)
    if (orientMatch) {
      result.orientation = orientMatch[1] || orientMatch[0]
    }
  }

  // Try to extract name
  if (!result.name) {
    const cleanText = text
      .replace(/(https?:\/\/[^\s]+)/g, '')
      .replace(/#小程序:\/\/[^\s]+/g, '')
      .replace(/「[^」]*」/g, '')
      .trim()

    const platformNames = ['链家', '贝壳', '贝壳找房', '自如', '安居客', '小红书', '我爱我家', '豆瓣']
    const segments = cleanText.split(/[·|｜\-–—,，\n]/).map(s => s.trim()).filter(Boolean)

    const nameSegment = segments.find(s => {
      let cleaned = s
      for (const pn of platformNames) {
        cleaned = cleaned.replace(new RegExp(pn, 'g'), '')
      }
      cleaned = cleaned.trim()
      return cleaned.length >= 2 && cleaned.length <= 20 && /[\u4e00-\u9fa5]/.test(cleaned)
        && !/\d+元/.test(cleaned) && !/\d+㎡/.test(cleaned) && !/\d室/.test(cleaned)
        && !/^(朝|南|北|东|西|楼层|整租|合租|月租|租金)/.test(cleaned)
    })
    if (nameSegment) {
      let name = nameSegment
      for (const pn of platformNames) {
        name = name.replace(new RegExp(pn, 'g'), '')
      }
      result.name = name.replace(/^[#@\s·]+/, '').trim()
    }
  }
}
