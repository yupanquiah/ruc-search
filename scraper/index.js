const { scrape } = require('./scraper.js');

(async () => {
  try {
    const ruc = "your number"
    const result = await scrape(ruc)
    console.log(result)
  } catch (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
})()
