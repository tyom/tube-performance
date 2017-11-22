const fs = require('fs')
const XLSX = require('xlsx')
const { endOfWeek, addWeeks, addDays } = require('date-fns')

const workbook = XLSX.readFile('./data/lu-performance-data-almanac.xlsx')
const currentSheet = workbook.Sheets['Platform Wait Time']

const TOTAL_PERIOD_COUNT = 13

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
    let currentYear = parseInt(currentPeriod && currentPeriod.split('/')[0])
    const firstPeriodDate = new Date(`${currentYear}-04-01`)
    const lastPeriodDate = new Date(`${currentYear + 1}-03-31`)

    if (isPeriodHeading) {
      currentPeriod = current[1]
      result[currentPeriod] = {
        lines: {},
      }
      return result
    }

    const currentPeriodValues = getPeriodValues(current)

    if (isTotal) {
      result[currentPeriod].periodDates = currentPeriodValues.map((value, i) => {
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
      result[currentPeriod].linesTotal = currentPeriodValues
    } else {
      result[currentPeriod].lines[heading] = currentPeriodValues
    }

    return result
  }, {})

  const result = {
    name: sheetArray[0][0],
    periods: transformedPeriods,
  }

  return JSON.stringify(result, null, 2)
}

const jsonData = transformSheetToJson(currentSheet)

fs.writeFileSync('data.json', jsonData)
