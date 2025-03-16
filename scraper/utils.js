const standardizeKey = (key) => {
  return key
    .toLowerCase()
    .replace(/ /g, '_')
    .replace(/:/g, '')
    .replace(/\(|\)/g, '')
}

module.exports = { standardizeKey }
