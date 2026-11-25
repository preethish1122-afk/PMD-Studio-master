/*
  Project page image layout.
  Images run down the page left-aligned, either alone or in pairs, and each one is sized from its
  real proportions: wide images get a large or medium height, a partner in a pair is usually
  smaller, and tall (portrait) images are given the bigger height so they don't look tiny.
  Pairs are centred against each other, so the smaller image floats beside the bigger one.

  Sizes are fractions of the gallery width, so the layout scales with the window.
*/

// Image heights as a share of the gallery width (taken from the reference layout).
const HEIGHT = { L: 0.39, M: 0.31, S: 0.27 }
const GAP = 0.06 // space between two images in a pair, as a share of the width
const PORTRAIT = 0.9 // width / height below this counts as a tall image

// Row pattern, repeated: one big image, a pair, a medium image, two pairs…
const PATTERN = ['L', 'LS', 'M', 'MS', 'SL']

const ratioOf = (figure) => {
  const img = figure.querySelector('img')
  return img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1.5
}

export function layoutGallery(gallery) {
  const figures = [...gallery.querySelectorAll('.g-item')]
  const rows = []
  let index = 0
  let step = 0

  while (index < figures.length) {
    let sizes = PATTERN[step % PATTERN.length]
    step++
    if (sizes.length === 2 && index + 1 >= figures.length) sizes = 'M'
    const group = figures.slice(index, index + sizes.length).map((figure, i) => {
      const ratio = ratioOf(figure)
      // A tall image always takes the larger height; alone, it is drawn a little taller still.
      let height = HEIGHT[ratio < PORTRAIT ? 'L' : sizes[i]]
      if (ratio < PORTRAIT && sizes.length === 1) height *= 1.45
      return { figure, ratio, width: height * ratio, role: sizes.length === 1 ? 'single' : sizes[i] }
    })
    index += group.length

    // Shrink the row if it would be wider than the column.
    const gaps = GAP * (group.length - 1)
    const total = group.reduce((sum, item) => sum + item.width, 0) + gaps
    if (total > 1) group.forEach((item) => { item.width *= (1 - gaps) / (total - gaps) })
    rows.push(group)
  }

  const fragment = document.createDocumentFragment()
  rows.forEach((group) => {
    const row = document.createElement('div')
    row.className = `g-row${group.length > 1 ? ' is-pair' : ''}`
    group.forEach(({ figure, ratio, width, role }) => {
      figure.style.setProperty('--w', `${(width * 100).toFixed(3)}%`)
      // Phones: one column; big and single images run full width, smaller ones narrower.
      const mobileWidth = ratio < PORTRAIT ? 72 : role === 'single' || role === 'L' ? 100 : 80
      figure.style.setProperty('--mw', `${mobileWidth}%`)
      figure.style.aspectRatio = ratio.toFixed(4)
      figure.style.setProperty('--r', ratio.toFixed(4)) // used by the PC layout to size the first image
      row.appendChild(figure)
    })
    fragment.appendChild(row)
  })
  gallery.replaceChildren(fragment)
  // The PC layout lines the title and text up with the first image, which is sized from this.
  if (rows[0]) gallery.parentElement.style.setProperty('--r1', rows[0][0].ratio.toFixed(4))
}

export function initGalleries() {
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    layoutGallery(gallery)
    // Re-arrange once real image sizes are known (images load lazily when the page is opened).
    let queued = false
    gallery.addEventListener('load', () => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => { queued = false; layoutGallery(gallery) })
    }, true)
  })
}
