const fs = require('fs')
const XLSX = require('xlsx')
const { endOfWeek, addWeeks, addDays } = require('date-fns')
const { kebabCase, isString } = require('lodash')

const TOTAL_PERIOD_COUNT = 13
const SPREADSHEET_PATH = './data/lu-performance-data-almanac.xlsx'

function parseNumber (value) {
  if (!isString(value)) { return null }
  const isFloat = /\d+\.\d+/.test(value)
  return isFloat ? parseFloat(value) : parseInt(value.replace(/,/g, ''), 10)
}

function getPeriodValues (array) {
  return array
    .slice(1)
    .map(parseNumber)
    .filter(x => x)
}

function getSheetData (sheetName) {
  const workbook = XLSX.readFile(SPREADSHEET_PATH)
  const sheet = workbook.Sheets[sheetName]

  if (!sheet) {
    throw Error(`'${sheetName}' sheet is not found in the workbook`)
  }

  return XLSX.utils.sheet_to_json(sheet, { header: 1 })
}

function getPeriodsRowIndex (sheetData) {
  if (!sheetData || !sheetData.length) {
    return null
  }
  return sheetData.findIndex(el => !el[0])
}

function getPeriodDataForSheet (sheetName) {
  const data = getSheetData(sheetName)
  const periodsHeadingIndex = getPeriodsRowIndex(data)

  return data.slice(periodsHeadingIndex + 1)
}

function getSummaryDataForSheet (sheetName) {
  const data = getSheetData(sheetName)
  const periodsHeadingIndex = getPeriodsRowIndex(data)

  return data.slice(0, periodsHeadingIndex)
}

function sheetArrayToObjectXf (array) {
  let currentPeriod = ''
  const sheetTitle = array[0][0]

  return array.reduce((acc, value) => {
    const heading = value[0]

    const isPeriodHeading = new RegExp(sheetTitle).test(heading)
    const isTotal = /^TOTAL/.test(heading)
    let periodYear = parseInt(currentPeriod.split('/')[0], 10)
    const firstPeriodDate = new Date(`${periodYear}-04-01`)
    const lastPeriodDate = new Date(`${periodYear + 1}-03-31`)

    if (isPeriodHeading) {
      currentPeriod = value[1]
      acc[currentPeriod] = {
        items: {},
      }
      return acc
    }

    const currentPeriodValues = getPeriodValues(value)

    if (isTotal) {
      acc[currentPeriod].dates = currentPeriodValues.map((value, i) => {
        // LU has 13 reporting periods of 28 days, from April to March.
        // The lengths of periods 1 and 13 may however vary to align with the financial year end of 31 March
        let startOfPeriodDate = addWeeks(endOfWeek(firstPeriodDate), 4 * i)
        let endOfPeriodDate = addWeeks(startOfPeriodDate, 4)

        startOfPeriodDate = i === 0 ? firstPeriodDate : addDays(startOfPeriodDate, 1)
        endOfPeriodDate = i === TOTAL_PERIOD_COUNT - 1 ? lastPeriodDate : endOfPeriodDate

        return {
          from: startOfPeriodDate,
          to: endOfPeriodDate,
        }
      })
      acc[currentPeriod].totals = currentPeriodValues
    } else {
      acc[currentPeriod].items[heading] = currentPeriodValues
    }
    return acc
  }, {})
}

function saveToJson(filename, data) {
  fs.writeFileSync(`data/${filename}.json`, data)
  console.info(`Saved data to '${filename}.json'`)
}

function buildJsonFromSheet (sheetName) {
  const json = sheetArrayToObjectXf(
    getPeriodDataForSheet(sheetName)
  )

  saveToJson(
    kebabCase(sheetName),
    JSON.stringify(json, null, 2),
  )
}

module.exports = {
  buildJsonFromSheet,
}
