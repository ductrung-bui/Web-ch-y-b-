import { useMemo } from 'react'
import parse from 'html-react-parser'

/**
 * Render nội dung body đã xuất từ Teleport (HTML chuỗi).
 */
export function TeleportPage({ html, slug = 'page' }) {
  const cleaned = useMemo(() => preprocessHtml(html), [html])

  return (
    <div className={`teleport-page teleport-page--${slug}`}>
      {parse(cleaned, { replace: domToReact })}
    </div>
  )
}

function domToReact(domNode) {
  if (domNode.type !== 'tag' || !domNode.attribs) return undefined
  const attribs = { ...domNode.attribs }
  if (attribs.class) {
    attribs.className = attribs.class
    delete attribs.class
  }
  if (attribs.for) {
    attribs.htmlFor = attribs.for
    delete attribs.for
  }
  domNode.attribs = attribs
  return undefined
}

function preprocessHtml(html) {
  if (!html) return ''
  let s = html
  s = s.replace(/<link[^>]*>/gi, '')
  s = s.replace(/src="public\//g, 'src="/')
  s = s.replace(/src='public\//g, "src='/")
  s = s.replace(/href="public\//g, 'href="/')
  s = s.replace(
    /<a[^>]*href="https:\/\/play\.teleporthq\.io\/signup"[^>]*>[\s\S]*?<\/a>/gi,
    '',
  )
  return s.trim()
}
