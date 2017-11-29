const fs = require('fs')
const XLSX = require('xlsx')
const { endOfWeek, addWeeks, addDays } = require('date-fns')
const { kebabCase, camelCase, isString, flatten, compact } = require('lodash')

const TOTAL_PERIOD_COUNT = 13

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

function loadSpreadsheet(filePath) {
  if (!filePath) {
    throw('XLSX file path is required')
  }
  return XLSX.readFile(filePath)
}

function getSheetData (workbook, sheetName) {
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

function getPeriodData (sheetData) {
  const periodsHeadingIndex = getPeriodsRowIndex(sheetData)

  return sheetData.slice(periodsHeadingIndex + 1)
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
    const periods = acc.periods || {}

    if (isPeriodHeading) {
      currentPeriod = value[1]
      acc.title = sheetTitle
      acc.slug = kebabCase(sheetTitle)
      acc.periods = Object.assign(periods, {
        [currentPeriod]: {
          items: {},
        }
      })
      return acc
    }

    const currentPeriodValues = getPeriodValues(value)

    if (isTotal) {
      acc.periods[currentPeriod].dates = currentPeriodValues.map((value, i) => {
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
      acc.periods[currentPeriod].totals = currentPeriodValues
    } else {
      acc.periods[currentPeriod].items[heading] = currentPeriodValues
    }
    return acc
  }, {})
}

function saveToJson(filename, data) {
  fs.writeFileSync(`static/${filename}.json`, data)
  console.info(`Saved data to '${filename}.json'`)
}

function buildJsonFromWorkbookSheets (workbook, sheetNames) {
  const names = compact(flatten([sheetNames]))
  if (!names.length) {
    throw Error('sheetNames is required')
  }

  const sheetsData = names.reduce((acc, sheetName) => {
    console.log('Processing:', sheetName)
    const sheetData = getSheetData(workbook, sheetName)
    const sheetKey = camelCase(sheetName)
    acc[sheetKey] = sheetArrayToObjectXf(
      getPeriodData(sheetData)
    )
    return acc
  }, {})

  saveToJson(
    'metrics',
    JSON.stringify(sheetsData, null, 2),
  )
}

module.exports = {
  loadSpreadsheet,
  buildJsonFromWorkbookSheets,
}
