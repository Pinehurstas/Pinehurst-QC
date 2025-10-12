export function initDiagnostics() {
  // Capture unhandled errors/promises and show a simple overlay
  function show(msg: string) {
    const id = 'diag-overlay'
    let el = document.getElementById(id)
    if (!el) {
      el = document.createElement('div')
      el.id = id
      el.style.position = 'fixed'
      el.style.bottom = '0'
      el.style.left = '0'
      el.style.right = '0'
      el.style.maxHeight = '40vh'
      el.style.overflow = 'auto'
      el.style.fontFamily = 'monospace'
      el.style.fontSize = '12px'
      el.style.background = 'rgba(0,0,0,0.85)'
      el.style.color = 'white'
      el.style.padding = '8px'
      el.style.zIndex = '99999'
      document.body.appendChild(el)
    }
    const p = document.createElement('div')
    p.textContent = `[${new Date().toISOString()}] ${msg}`
    el.appendChild(p)
  }
  window.addEventListener('error', (e) => show(`error: ${e.message}`))
  window.addEventListener('unhandledrejection', (e: any) => show(`promise: ${e?.reason?.message || e?.reason || ''}`))
}
