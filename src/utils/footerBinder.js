import { FOOTER_ICON, FOOTER_LINK_GROUPS, FOOTER_SOCIAL_LINKS } from '../constants/siteFooter.js'
import { SITE_LOGO_ALT, SITE_LOGO_URL } from '../constants/siteAssets.js'

function setRowIcon(row, iconSrc, alt) {
  const img = row?.querySelector('img')
  if (img) {
    img.src = iconSrc
    img.alt = alt
    img.style.display = 'block'
  }
}

function setRowText(row, text) {
  const host = row?.querySelector('.site-footer__contact-link, span')
  if (host) host.textContent = text ?? ''
}

function fillContactRows(frame69, contacts) {
  if (!frame69) return

  const addresses = contacts.filter((c) => c.type === 'address')
  const hotline = contacts.find((c) => c.type === 'hotline')
  const email = contacts.find((c) => c.type === 'email')

  const addrRows = [
    frame69.querySelector('[class*="frameach-elm1"]'),
    frame69.querySelector('[class*="frameach-elm2"]'),
  ]

  addresses.slice(0, 2).forEach((item, i) => {
    const row = addrRows[i]
    if (!row) return
    row.style.display = ''
    setRowIcon(row, FOOTER_ICON.mapPin, 'Địa chỉ')
    setRowText(row, item.value)
  })
  for (let i = addresses.length; i < addrRows.length; i += 1) {
    if (addrRows[i]) addrRows[i].style.display = 'none'
  }

  const hotlineRow = frame69.querySelector('[class*="hotline-elm"]')
  if (hotline && hotlineRow) {
    hotlineRow.style.display = ''
    setRowIcon(hotlineRow, FOOTER_ICON.phone, 'Hotline')
    const phone = hotline.value.replace(/\s/g, '')
    setRowText(hotlineRow, hotline.value)
    const link = hotlineRow.querySelector('a.site-footer__contact-link')
    if (link) link.href = `tel:${phone}`
  } else if (hotlineRow) {
    hotlineRow.style.display = 'none'
  }

  const mailRow = frame69.querySelector('[class*="mail-elm1"]')
  if (email && mailRow) {
    mailRow.style.display = ''
    setRowIcon(mailRow, FOOTER_ICON.mail, 'Email')
    setRowText(mailRow, email.value)
    const link = mailRow.querySelector('a.site-footer__contact-link')
    if (link) link.href = `mailto:${email.value}`
  } else if (mailRow) {
    mailRow.style.display = 'none'
  }
}

function injectLinkList(listEl, group) {
  if (!listEl) return

  const titleHost = listEl.querySelector('[class*="title-elm"] span, [class*="text-strong"] span')
  if (titleHost) titleHost.textContent = group.title

  let linksBox = listEl.querySelector('.site-footer__links')
  if (!linksBox) {
    linksBox = document.createElement('nav')
    linksBox.className = 'site-footer__links'
    linksBox.setAttribute('aria-label', group.title)
    listEl.appendChild(linksBox)
  }

  linksBox.innerHTML = ''
  group.links.forEach(({ label, href }) => {
    const a = document.createElement('a')
    a.className = 'site-footer__link'
    a.href = href
    a.textContent = label
    linksBox.appendChild(a)
  })
}

function setupSocial(frame70) {
  if (!frame70) return

  frame70.querySelectorAll('img').forEach((img) => {
    img.style.display = 'none'
  })
  frame70.querySelector('[class*="instagram-elm"]')?.style.setProperty('display', 'none')

  let title = frame70.querySelector('.site-footer__social-title')
  if (!title) {
    title = document.createElement('p')
    title.className = 'site-footer__social-title Heading'
    title.textContent = 'Kết nối với chúng tôi'
    frame70.prepend(title)
  }

  let social = frame70.querySelector('.site-footer__social')
  if (!social) {
    social = document.createElement('div')
    social.className = 'site-footer__social'
    frame70.appendChild(social)
  }

  social.innerHTML = ''
  FOOTER_SOCIAL_LINKS.forEach(({ label, href, icon }) => {
    const a = document.createElement('a')
    a.className = 'site-footer__social-btn'
    a.href = href
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.setAttribute('aria-label', label)

    const img = document.createElement('img')
    img.className = 'site-footer__social-icon'
    img.src = icon
    img.alt = ''
    img.width = 40
    img.height = 40
    img.loading = 'lazy'
    a.appendChild(img)

    social.appendChild(a)
  })
}

function wrapContactLinks(frame69) {
  if (!frame69) return

  const hotlineRow = frame69.querySelector('[class*="hotline-elm"]')
  const mailRow = frame69.querySelector('[class*="mail-elm1"]')

  ;[hotlineRow, mailRow].forEach((row) => {
    if (!row) return
    const span = row.querySelector('span')
    if (!span || row.querySelector('a.site-footer__contact-link')) return
    const a = document.createElement('a')
    a.className = 'site-footer__contact-link BodyBase'
    a.href = '#'
    span.replaceWith(a)
    a.appendChild(span)
  })
}

function ensureCopyright(footer) {
  let copy = footer.querySelector('.site-footer__copy')
  if (!copy) {
    copy = document.createElement('p')
    copy.className = 'site-footer__copy'
    footer.appendChild(copy)
  }
  copy.textContent = `© ${new Date().getFullYear()} Thế Giới Chạy Bộ. All rights reserved.`
}

function bindSpaLinks(footer, navigate) {
  if (!navigate) return

  footer.querySelectorAll('.site-footer__link').forEach((a) => {
    if (a.dataset.footerSpaBound) return
    a.dataset.footerSpaBound = '1'

    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href')
      if (!href || !href.startsWith('/') || href.startsWith('//')) return
      e.preventDefault()
      navigate(href)
    })
  })
}

function hideStrayTeleportChrome(footer) {
  footer.querySelector(':scope > [class*="text-strong-elm3"]')?.style.setProperty('display', 'none')
}

/**
 * Chuẩn hóa footer Teleport trên mọi trang.
 */
export function bindSiteFooter(page, contacts = [], options = {}) {
  const footer = page.querySelector('[class*="footer-elm"]')
  if (!footer) return

  footer.classList.add('site-footer')
  hideStrayTeleportChrome(footer)

  const logo = footer.querySelector('[class*="logotchnn"] img, [class*="logo"] img')
  if (logo) {
    logo.src = SITE_LOGO_URL
    logo.alt = SITE_LOGO_ALT
    logo.style.display = 'block'
  }

  const lists = footer.querySelectorAll('[class*="text-link-list-elm"]')
  FOOTER_LINK_GROUPS.forEach((group, i) => {
    injectLinkList(lists[i], group)
  })

  const frame69 = footer.querySelector('[class*="frame69-elm"]')
  wrapContactLinks(frame69)
  fillContactRows(frame69, contacts)

  const frame70 = footer.querySelector('[class*="frame70-elm"]')
  setupSocial(frame70)

  ensureCopyright(footer)
  bindSpaLinks(footer, options.navigate)

  footer.dataset.footerBound = '1'
}
