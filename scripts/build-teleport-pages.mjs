/**
 * Đọc HTML/CSS từ public/pages, tách phần body → src/snippets,
 * chuẩn hóa url("public/...") → url("/..."), rồi ghi src/pages/css + src/pages/views.
 * Chạy: node scripts/build-teleport-pages.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const publicPages = path.join(root, 'public/pages')
const snippetsDir = path.join(root, 'src/snippets')
const cssDir = path.join(root, 'src/pages/css')
const viewsDir = path.join(root, 'src/pages/views')

/** slug → đường dẫn React Router */
export const PAGE_ROUTES = [
  ['index', '/'],
  ['dangnhap', '/dang-nhap'],
  ['dangky', '/dang-ky'],
  ['dangxuat', '/dang-xuat'],
  ['thaydoimatkhau', '/thay-doi-mat-khau'],
  ['nhapemailkhoiphuc', '/nhap-email-khoi-phuc'],
  ['khoiphucmatkhau', '/khoi-phuc-mat-khau'],
  ['mnhnhtrangch', '/trang-chu'],
  ['mnhnhchititchuyni', '/chi-tiet-chuyen-di'],
  ['manhinhchonthoigianchuyendi', '/chon-thoi-gian-chuyen-di'],
  ['manhinhchonvitrighengoi', '/chon-vi-tri-ghe'],
  ['manhinhdienthongtin', '/dien-thong-tin'],
  ['manhinhthanhtoan', '/thanh-toan'],
  ['dichvubosung', '/dich-vu-bo-sung'],
  ['thongtinvedadat', '/ve-da-dat'],
  ['thongtinvedahuy', '/ve-da-huy'],
  ['lichsuchuyendi', '/lich-su-chuyen-di'],
  ['lchtrongthng', '/lich-trong-thang'],
  ['kinhnghim', '/kinh-nghiem'],
]

function extractBodyInner(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
  if (!m) return ''
  let inner = m[1]
  inner = inner.replace(/<link[^>]*>/gi, '')
  inner = inner.replace(/src="public\//g, 'src="/')
  inner = inner.replace(/src='public\//g, "src='/")
  inner = inner.replace(/href="public\//g, 'href="/')
  return inner.trim()
}

function processCss(content, slug) {
  if (content.includes('<!DOCTYPE html>') || content.includes('<html ')) {
    return (
      `/**\n * CẢNH BÁO: public/pages/${slug}.css bị lẫn nội dung HTML hoặc hỏng.\n` +
      ` * Với trang trang chủ Teleport, thường cần file **mnhnhtrangch-ttc.css** — hãy dán CSS đúng vào đây rồi chạy lại script.\n */\n\n` +
      `.teleport-page--${slug} { min-height: 40vh; padding: 1rem; }\n`
    )
  }
  let out = content
  out = out.replace(/url\(["']?public\//g, 'url("/')
  out = out.replace(/url\(\s*public\//g, 'url(/')
  return out
}

function viewComponentName(slug) {
  if (slug === 'index') return 'IndexView'
  return slug[0].toUpperCase() + slug.slice(1) + 'View'
}

fs.mkdirSync(snippetsDir, { recursive: true })
fs.mkdirSync(cssDir, { recursive: true })
fs.mkdirSync(viewsDir, { recursive: true })

for (const [slug] of PAGE_ROUTES) {
  const htmlPath = path.join(publicPages, `${slug}.html`)
  const cssPath = path.join(publicPages, `${slug}.css`)
  if (!fs.existsSync(htmlPath)) {
    console.warn('Thiếu HTML:', htmlPath)
    continue
  }
  const rawHtml = fs.readFileSync(htmlPath, 'utf8')
  fs.writeFileSync(
    path.join(snippetsDir, `${slug}.html`),
    extractBodyInner(rawHtml),
    'utf8',
  )

  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf8')
    fs.writeFileSync(
      path.join(cssDir, `${slug}.css`),
      processCss(css, slug),
      'utf8',
    )
  } else {
    console.warn('Thiếu CSS:', cssPath)
  }

  const comp = viewComponentName(slug)
  const jsx = `import { ConnectedPage } from '../../components/ConnectedPage.jsx'
import html from '../../snippets/${slug}.html?raw'
import '../css/${slug}.css'

export default function ${comp}() {
  return <ConnectedPage html={html} slug="${slug}" />
}
`
  fs.writeFileSync(path.join(viewsDir, `${slug}.jsx`), jsx, 'utf8')
}

console.log('Đã sinh snippets, css, views cho', PAGE_ROUTES.length, 'trang.')
