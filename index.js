const fs = require('fs')
const XLSX = require('xlsx')
const { assign } = require('lodash')

const { REPORTING_PERIODS } = require('./constants')

const workbook = XLSX.readFile('./data/lu-performance-data-almanac.xlsx')
const currentSheet = workbook.Sheets['Platform Wait Time']

function getPeriodValues (array) {
  return array
    .slice(1)
    .map(parseFloat)
    .filter(x => x)
}

function transformSheetToJson (sheet) {
  const sheetArray = XLSX.utils.sheet_to_json(sheet, { header: 1 })
  const periodsHeadingIndex = sheetArray.findIndex(el => !el[0])
  const allPeriods = sheetArray.slice(periodsHeadingIndex + 1)
  let currentPeriod

  const transformedPeriods = allPeriods.reduce((result, current) => {
    const heading = current[0]
    const isPeriodHeading = heading === 'Platform Wait Time'
    const isTotal = heading === 'TOTAL ALL LINES'

    if (isPeriodHeading) {
      currentPeriod = current[1]
      result[currentPeriod] = {
        dates: REPORTING_PERIODS[currentPeriod],
        lines: {},
      }
    } else if (isTotal) {
      result[currentPeriod].linesTotal = getPeriodValues(current)
    } else {
      result[currentPeriod].lines[heading] = getPeriodValues(current)
    }

    return result
  }, {})

  const result = {
    name: sheetArray[0][0],
    periods: transformedPeriods,
  }

  // console.dir(
  //   result,
  //   { depth: null },
  // )

  return JSON.stringify(result, null, 2)
}

const jsonData = transformSheetToJson(currentSheet)

fs.writeFileSync('data.json', jsonData)
