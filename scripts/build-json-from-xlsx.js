const path = require('path')
const { loadSpreadsheet, buildJsonFromWorkbookSheets } = require('../src/transform')

const workbook = loadSpreadsheet(path.join(__dirname, '../data/lu-performance-data-almanac.xlsx'))
const sheetNames = workbook.SheetNames.slice(23, 27)

buildJsonFromWorkbookSheets(workbook, sheetNames)
