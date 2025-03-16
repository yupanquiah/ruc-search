const { run } = require('./scraper.js');

(async () => {
  try {
    const ruc = "number"
    const result = await run(ruc)
    console.log(result)
  } catch (error) {
    console.error("❌ Error:", error.message)
    process.exit(1)
  }
})()
