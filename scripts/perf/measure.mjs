import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const CDP_PORT = 9222
const ITERATIONS = Number(process.env.ITERATIONS || 3)
const CPU_RATE = Number(process.env.CPU_RATE || 4)

const ALL_MODES = [
  { label: 'dev', url: 'http://localhost:5173/' },
  { label: 'preview', url: 'http://localhost:4173/' },
  { label: 'preview-sin-blur', url: 'http://localhost:4173/', noBlur: true }
]

const MODES = process.env.MODE_ONLY
  ? ALL_MODES.filter((mode) => mode.label === process.env.MODE_ONLY)
  : ALL_MODES

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl)
    this.id = 0
    this.pending = new Map()
    this.listeners = new Map()
    this.readyPromise = new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve, { once: true })
      this.ws.addEventListener('error', reject, { once: true })
    })
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id) {
        const pending = this.pending.get(message.id)
        if (!pending) return
        this.pending.delete(message.id)
        if (message.error) pending.reject(new Error(JSON.stringify(message.error)))
        else pending.resolve(message.result)
        return
      }
      const handlers = this.listeners.get(message.method) || []
      handlers.forEach((handler) => handler(message.params))
    })
  }

  async ready() {
    await this.readyPromise
    return this
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  on(method, handler) {
    const handlers = this.listeners.get(method) || []
    handlers.push(handler)
    this.listeners.set(method, handlers)
    return () => {
      const current = this.listeners.get(method) || []
      this.listeners.set(
        method,
        current.filter((item) => item !== handler)
      )
    }
  }

  once(method, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off()
        reject(new Error(`Timeout esperando ${method}`))
      }, timeout)
      const off = this.on(method, (params) => {
        clearTimeout(timer)
        off()
        resolve(params)
      })
    })
  }

  close() {
    try {
      this.ws.close()
    } catch {
      // noop
    }
  }
}

async function getPageTarget() {
  const response = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)
  const targets = await response.json()
  const page = targets.find((target) => target.type === 'page')
  if (!page) throw new Error('No hay target de página en Chromium')
  return page
}

function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2) return sorted[middle]
  return (sorted[middle - 1] + sorted[middle]) / 2
}

async function main() {
  const target = await getPageTarget()
  const cdp = await new CDP(target.webSocketDebuggerUrl).ready()

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Performance.enable')
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false
  })

  async function evaluate(expression, awaitPromise = false) {
    const result = await cdp.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise
    })
    if (result.exceptionDetails) {
      throw new Error(
        `Error evaluando JS: ${result.exceptionDetails.text} ${result.exceptionDetails.exception?.description || ''}`
      )
    }
    return result.result.value
  }

  async function waitFor(expression, timeout = 30000, interval = 100) {
    const start = Date.now()
    let lastError = null
    while (Date.now() - start < timeout) {
      try {
        if (await evaluate(expression)) return true
      } catch (error) {
        lastError = error
      }
      await delay(interval)
    }
    throw new Error(`Timeout esperando: ${expression}${lastError ? ` (${lastError.message})` : ''}`)
  }

  async function goto(url) {
    const loaded = cdp.once('Page.loadEventFired', 20000).catch(() => null)
    await cdp.send('Page.navigate', { url })
    await loaded
    await delay(600)
  }

  async function login(url, email, password, expectation) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    await goto(url)
    await evaluate(`(() => { localStorage.clear(); sessionStorage.clear(); return true })()`)
    await cdp.send('Page.reload', { ignoreCache: true })
    await delay(600)
    await waitFor(
      `(() => {
        const raw = localStorage.getItem('solumcare:users')
        return raw && JSON.parse(raw).length > 0
      })()`,
      30000
    )
    await waitFor(
      `Boolean(document.querySelector('input[type="email"]') && document.querySelector('input[type="password"]'))`,
      30000
    )
    await delay(400)
    const filled = await evaluate(`(() => {
      const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
      const emailInput = document.querySelector('input[type="email"]')
      const passwordInput = document.querySelector('input[type="password"]')
      if (!emailInput || !passwordInput) return false
      setValue.call(emailInput, ${JSON.stringify(email)})
      emailInput.dispatchEvent(new Event('input', { bubbles: true }))
      setValue.call(passwordInput, ${JSON.stringify(password)})
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
      return true
    })()`)
    if (!filled) throw new Error('No pude rellenar el formulario de login')
    await delay(350)
    await evaluate(`(() => {
      const form = document.querySelector('input[type="email"]')?.closest('form')
      if (!form) return false
      form.requestSubmit()
      return true
    })()`)
    try {
      await waitFor(expectation, 45000)
    } catch (error) {
      const body = await evaluate('document.body.innerText.slice(0, 1200)')
      const inputs = await evaluate(`(() => [...document.querySelectorAll('input')].map((item) => ({ type: item.type, value: item.value })))()`)
      throw new Error(`${error.message}\nBody: ${body}\nInputs: ${JSON.stringify(inputs)}`)
    }
    await delay(900)
    await evaluate(`(() => {
      window.__lt = []
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) window.__lt.push(entry.duration)
        }).observe({ type: 'longtask', buffered: true })
      } catch {}
      return true
    })()`)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_RATE })
    await delay(200)
  }

  async function injectNoBlur() {
    await evaluate(`(() => {
      if (document.getElementById('__no_blur')) return true
      const style = document.createElement('style')
      style.id = '__no_blur'
      style.textContent = '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'
      document.head.appendChild(style)
      return true
    })()`)
  }

  async function clickNav(label) {
    const clicked = await evaluate(`(() => {
      const buttons = [...document.querySelectorAll('aside nav button')]
      const button = buttons.find((item) => item.textContent.trim().startsWith(${JSON.stringify(label)}))
      if (!button) return false
      button.click()
      return true
    })()`)
    if (!clicked) throw new Error(`No encontré navegación: ${label}`)
    return clicked
  }

  async function clickText(text, scope = 'button') {
    return evaluate(`(() => {
      const elements = [...document.querySelectorAll(${JSON.stringify(scope)})]
      const element = elements.find((item) => item.textContent.trim().includes(${JSON.stringify(text)}))
      if (!element) return false
      element.click()
      return true
    })()`)
  }

  async function closeDialog() {
    const closed = await evaluate(`(() => {
      const button = document.querySelector('[role="dialog"] button[aria-label="Cerrar"]')
      if (button) { button.click(); return true }
      return false
    })()`)
    if (!closed) await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`)
    await delay(450)
  }

  async function scrollMain(offset = 700) {
    await evaluate(`(() => {
      const containers = [...document.querySelectorAll('.phone-scroll')]
      const target = containers.find((item) => item.scrollHeight > item.clientHeight + 40) || containers[0]
      if (target) target.scrollTop = Math.min(target.scrollHeight, ${offset})
      return Boolean(target)
    })()`)
    await delay(350)
  }

  async function getMetrics() {
    const { metrics } = await cdp.send('Performance.getMetrics')
    return Object.fromEntries(metrics.map((metric) => [metric.name, metric.value]))
  }

  async function getLongTasks() {
    try {
      return await evaluate('Array.isArray(window.__lt) ? window.__lt.slice() : []')
    } catch {
      return []
    }
  }

  function diffMetrics(before, after) {
    const names = [
      'TaskDuration',
      'ScriptDuration',
      'RecalcStyleDuration',
      'LayoutDuration',
      'LayoutCount',
      'RecalcStyleCount',
      'JSHeapUsedSize',
      'Nodes'
    ]
    const output = {}
    for (const name of names) {
      output[name] = (after[name] || 0) - (before[name] || 0)
    }
    return output
  }

  async function measure(name, reset, action, after) {
    const samples = []
    for (let iteration = 0; iteration < ITERATIONS; iteration += 1) {
      if (reset) {
        await reset()
        await delay(650)
      }
      await evaluate('window.__lt = []; true')
      const before = await getMetrics()
      const started = Date.now()
      await action()
      await delay(800)
      const elapsed = Date.now() - started
      const afterMetrics = await getMetrics()
      const longTasks = await getLongTasks()
      samples.push({
        ...diffMetrics(before, afterMetrics),
        wallMs: elapsed,
        longTaskCount: longTasks.length,
        longTaskMaxMs: longTasks.length ? Math.max(...longTasks) : 0,
        longTaskSumMs: longTasks.reduce((sum, value) => sum + value, 0)
      })
      if (after) await after()
      await delay(250)
    }

    const summary = {}
    for (const key of Object.keys(samples[0])) {
      summary[key] = median(samples.map((sample) => sample[key]))
    }
    return {
      name,
      samples,
      median: {
        taskMs: summary.TaskDuration * 1000,
        scriptMs: summary.ScriptDuration * 1000,
        styleMs: summary.RecalcStyleDuration * 1000,
        layoutMs: summary.LayoutDuration * 1000,
        layoutCount: summary.LayoutCount,
        styleCount: summary.RecalcStyleCount,
        heapMb: summary.JSHeapUsedSize / (1024 * 1024),
        wallMs: summary.wallMs,
        longTaskCount: summary.longTaskCount,
        longTaskMaxMs: summary.longTaskMaxMs,
        longTaskSumMs: summary.longTaskSumMs
      }
    }
  }

  async function runMode(mode) {
    const results = { mode: mode.label, url: mode.url, cpuRate: CPU_RATE, iterations: ITERATIONS }

    results.client = {}

    await login(
      mode.url,
      'lucia@example.com',
      'Lucia2026!',
      `/hoy toca subir tu foto/i.test(document.body.innerText)`
    )
    if (mode.noBlur) await injectNoBlur()

    const resetToHome = async () => clickNav('Inicio')
    const resetToGate = async () => {
      const hasNav = await evaluate(`Boolean(document.querySelector('aside nav button'))`)
      if (hasNav) await clickNav('Inicio')
    }

    results.client['Gate de foto (Lucía)'] = await measure(
      'Gate de foto (Lucía)',
      resetToGate,
      async () => {
        const clicked = await clickText('Subir foto ahora', 'main button')
        if (!clicked) throw new Error('No encontré Subir foto ahora')
        await waitFor(`/fotos del día/i.test(document.body.innerText)`, 15000)
      }
    )

    await login(
      mode.url,
      'diego@example.com',
      'Cliente2026!',
      `/cuidados del día/i.test(document.body.innerText)`
    )
    if (mode.noBlur) await injectNoBlur()

    const resetToGuide = async () => clickNav('Guía')
    results.client['Inicio y checklist'] = await measure(
      'Inicio y checklist',
      resetToGuide,
      async () => {
        await clickNav('Inicio')
        await delay(250)
        await evaluate(`(() => {
          const button = document.querySelector('main button[aria-pressed]')
          if (button) button.click()
          return Boolean(button)
        })()`)
      }
    )
    results.client.Fotos = await measure('Fotos', resetToHome, async () => {
      await clickNav('Fotos')
      await delay(300)
      await scrollMain(600)
    })
    results.client.Notas = await measure('Notas', resetToHome, async () => {
      await clickNav('Notas')
    })
    results.client['Cuenta y ajustes'] = await measure(
      'Cuenta y ajustes',
      resetToHome,
      async () => {
        const opened = await evaluate(`(() => {
          const button = [...document.querySelectorAll('aside button')]
            .find((item) => item.textContent.includes('Cuenta y ajustes'))
          if (!button) return false
          button.click()
          return true
        })()`)
        if (!opened) throw new Error('No encontré Cuenta y ajustes')
        await waitFor(`Boolean(document.querySelector('[role="dialog"]'))`, 10000)
      },
      closeDialog
    )

    await login(
      mode.url,
      'mara@solumcare.app',
      'Solum2026!',
      `/panel del estudio/i.test(document.body.innerText)`
    )
    if (mode.noBlur) await injectNoBlur()

    const resetToClients = async () => clickNav('Clientes')
    const resetToFeed = async () => clickNav('Fotos')

    async function openLucia() {
      await clickNav('Clientes')
      await delay(350)
      const clicked = await clickText('Lucía', 'main ul li button')
      if (!clicked) throw new Error('No encontré la ficha de Lucía')
      await waitFor(`/ficha del cliente/i.test(document.body.innerText)`, 15000)
      await delay(600)
    }

    results.artist = {}
    results.artist.Clientes = await measure('Clientes', resetToFeed, async () => {
      await clickNav('Clientes')
    })
    results.artist['Ficha de cliente'] = await measure('Ficha de cliente', resetToClients, openLucia)
    results.artist['Revisión de foto'] = await measure(
      'Revisión de foto',
      openLucia,
      async () => {
        const clicked = await clickText('Revisar', 'main button')
        if (!clicked) throw new Error('No encontré el botón Revisar')
        await waitFor(`Boolean(document.querySelector('[role="dialog"]'))`, 10000)
      },
      closeDialog
    )
    results.artist['Feed de evidencias'] = await measure(
      'Feed de evidencias',
      resetToClients,
      async () => {
        await clickNav('Fotos')
        await delay(400)
        await scrollMain(700)
      }
    )
    results.artist['Cuenta y ajustes'] = await measure(
      'Cuenta y ajustes',
      resetToClients,
      async () => {
        const opened = await evaluate(`(() => {
          const button = [...document.querySelectorAll('aside button')]
            .find((item) => item.textContent.includes('Cuenta y ajustes'))
          if (!button) return false
          button.click()
          return true
        })()`)
        if (!opened) throw new Error('No encontré Cuenta y ajustes')
        await waitFor(`Boolean(document.querySelector('[role="dialog"]'))`, 10000)
      },
      closeDialog
    )

    return results
  }

  const allResults = []
  for (const mode of MODES) {
    console.log(`\n=== Midiendo ${mode.label} (${mode.url}) ===`)
    const result = await runMode(mode)
    allResults.push(result)
    for (const [role, flows] of Object.entries({ client: result.client, artist: result.artist })) {
      for (const [name, data] of Object.entries(flows)) {
        console.log(
          `${role.padEnd(6)} | ${name.padEnd(20)} | task ${data.median.taskMs.toFixed(1)} ms | script ${data.median.scriptMs.toFixed(1)} ms | style ${data.median.styleMs.toFixed(1)} ms | layout ${data.median.layoutMs.toFixed(1)} ms | longtasks ${data.median.longTaskCount}`
        )
      }
    }
  }

  const outputPath = process.env.OUTPUT || path.join(os.tmpdir(), 'solumcare-perf-results.json')
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2))
  console.log(`\nResultados guardados en ${outputPath}`)
  cdp.close()
}

main().catch((error) => {
  console.error('FALLO:', error)
  process.exit(1)
})
