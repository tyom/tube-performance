const { buildJsonFromSheet } = require('../src/transform')
const { loadSpreadsheet, saveToJson } = require('../src/transform')

const workbook = loadSpreadsheet()
const sheetNames = workbook.SheetNames.slice(23, 27)

sheetNames.forEach(buildJsonFromSheet)
