/* Homepage crossfade using the five project cover images. */
const INTERVAL = 3500 // ms each image stays up

export function pickSlides(site, projects) {
  return projects.map((project) => ({ image: project.image, alt: project.alt }))
}

export const slideshowMarkup = (slides) => slides.map((slide, index) => `
  <div class="hero-slide${index === 0 ? ' is-active' : ''}"${index ? ' aria-hidden="true"' : ''}>
    <img ${index === 0 ? `src="${slide.image}" loading="eager" fetchpriority="high"` : `data-src="${slide.image}" loading="lazy"`} alt="${slide.alt}" decoding="async">
  </div>`).join('')

// Load an image that so far only has data-src; resolves once it can be shown.
function load(img) {
  if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src }
  return img.complete && img.naturalWidth ? Promise.resolve() : img.decode().catch(() => {})
}

export function initSlideshow(container, isOnHome) {
  const slides = [...container.querySelectorAll('.hero-slide')]
  if (slides.length < 2) return

  let index = 0
  let timer = 0

  const show = async (next) => {
    const incoming = slides[next]
    await load(incoming.querySelector('img'))
    const outgoing = slides[index]
    incoming.classList.add('is-active')
    incoming.removeAttribute('aria-hidden')
    outgoing.classList.remove('is-active')
    outgoing.setAttribute('aria-hidden', 'true')
    index = next
    load(slides[(index + 1) % slides.length].querySelector('img')) // get the next one ready
  }

  const tick = async () => {
    timer = 0
    if (!running()) return
    await show((index + 1) % slides.length)
    schedule()
  }
  const running = () => isOnHome() && !document.hidden
  const schedule = () => { if (!timer && running()) timer = setTimeout(tick, INTERVAL) }
  const update = () => {
    if (running()) schedule()
    else { clearTimeout(timer); timer = 0 }
  }

  document.addEventListener('visibilitychange', update)
  window.addEventListener('hashchange', () => setTimeout(update))
  load(slides[1].querySelector('img'))
  setTimeout(update) // start once the page has worked out which view is showing
}
