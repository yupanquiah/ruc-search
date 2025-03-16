const { chromium } = require('playwright')
const { standardizeKey } = require('./utils.js')
const { SCRAPER_CONFIG } = require('./config.js')
const fs = require('fs')

const run = async (ruc) => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: SCRAPER_CONFIG.userAgent
  })

  const page = await context.newPage()
  const url = SCRAPER_CONFIG.url
  await page.goto(url, { waitUntil: 'networkidle' })

  if (typeof ruc !== 'string' || ruc.length !== 11 || isNaN(Number(ruc))) {
    throw new Error("El RUC debe tener exactamente 11 dígitos numéricos.")
  }

  await page.locator('#txtRuc').waitFor({ state: 'visible' })
  await page.fill('#txtRuc', ruc)

  await page.locator('#btnAceptar').waitFor({ state: 'visible' })
  await page.click('#btnAceptar')

  await page.waitForTimeout(2000)
  await page.waitForLoadState('networkidle')

  if (page.url() !== SCRAPER_CONFIG.resultUrl) {
    return { success: false, message: "No se encontraron resultados" }
  }

  let data = { success: true }

  try {
    const rucRazonSocialXPath = 'xpath=/html/body/div/div[2]/div/div[3]/div[2]/div[1]/div/div[2]/h4'
    const rucRazonSocial = await page.locator(rucRazonSocialXPath).innerText()
    const [rucExtracted, razonSocial] = rucRazonSocial.split(' - ', 2)
    data["ruc"] = rucExtracted
    data["razon_social"] = razonSocial
  } catch (error) {
    data["ruc"] = null
    data["razon_social"] = null
  }

  const listGroupItems = await page.locator('div.list-group-item').all()

  for (const item of listGroupItems) {
    const h4Element = await item.locator('h4.list-group-item-heading').first()
    const pElement = await item.locator('p.list-group-item-text').first()

    if (await h4Element.isVisible() && await pElement.isVisible()) {
      const key = standardizeKey(await h4Element.innerText())
      const value = await pElement.innerText()
      data[key] = value
    }

    const tableElement = await item.locator('table.tblResultado')
    if (await tableElement.isVisible()) {
      const tableKey = standardizeKey(await h4Element.innerText())
      const rows = await tableElement.locator('tbody tr').all()
      const tableData = []

      for (const row of rows) {
        const cells = await row.locator('td').all()
        for (const cell of cells) {
          tableData.push(await cell.innerText())
        }
      }

      data[tableKey] = tableData
    }
  }

  await page.screenshot({ path: 'resultado.png', fullPage: true })

  fs.writeFileSync('consulta.json', JSON.stringify(data, null, 4), 'utf-8')

  await browser.close()
  return data
}

module.exports = { run }
