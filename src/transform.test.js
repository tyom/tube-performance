const transform = require('./transform')

const mockSheetData = [
  ['Heading'],
  [ 'Heading', '2016/17', '2017/18'],
  ['', '1', '2', '3', '4', '5'],
  ['Heading', '2016/17'],
  ['Section #1', '2', '4', '6', '8', '10'],
  ['Section #2', '1', '3', '5', '7', '9'],
  ['Heading', '2017/18'],
  ['Section #1', '2.1', '4.1', '1.6', '1.8', '1.0'],
  ['Section #2', '1.1', '3.1', '1.5', '1.7', '1.9'],
]

const mockPeriodData = mockSheetData.slice(3)

const workbookMock = {
  Sheets: {
    'Sheet name': mockSheetData,
  }
}

jest.mock('xlsx', () => ({
  readFile: fileName => `[${fileName} contents]`,
  utils: {
    sheet_to_json () {
      return [
        ['Heading'],
        ['Heading', '2016/17', '2017/18'],
        ['', '1', '2', '3', '4', '5'],
        ['Heading', '2016/17'],
        ['Section #1', '2', '4', '6', '8', '10'],
      ]
    }
  }
}))

jest.mock('fs', () => ({
  writeFileSync: jest.fn(),
}))

describe('#parseNumber', () => {
  const parseNumber = transform.__get__('parseNumber')

  it('should return null for non-string values', () => {
    expect(parseNumber(1)).toBeNull()
    expect(parseNumber(NaN)).toBeNull()
    expect(parseNumber(undefined)).toBeNull()
  })

  it('should return float for decimal value', () => {
    expect(parseNumber('2.1')).toEqual(2.1)
    expect(parseNumber('0.0')).toEqual(0)
  })

  it('should return integer for whole number value', () => {
    expect(parseNumber('0')).toEqual(0)
    expect(parseNumber('123')).toEqual(123)
    expect(parseNumber('1,234,567')).toEqual(1234567)
  })
})

describe('#getPeriodValues', () => {
  const getPeriodValues = transform.__get__('getPeriodValues')
  const parseNumberMock = value => parseInt(value[1], 10)

  beforeEach(() => {
    transform.__set__('parseNumber', parseNumberMock)
  })

  afterEach(() => {
    transform.__ResetDependency__('parseNumber')
  })

  it('should return an array of period values without falsey items', () => {
    const arrayData = [
      ['A', 'Q'],
      ['B', '1'],
      ['C', '2'],
      ['D', '3'],
      ['Z'],
      ['BB', '10'],
    ]
    const actual = getPeriodValues(arrayData)
    const expected = [1, 2, 3, 10]

    expect(actual).toEqual(expected)
  })
})

describe('#loadSpreadsheet', () => {
  const loadSpreadsheet = transform.__get__('loadSpreadsheet')

  it('should return loaded file contents', () => {
    const actual = loadSpreadsheet('spreadsheet')

    expect(actual).toEqual('[spreadsheet contents]')
  })

  it('should throw an error without file path', () => {
    const actual = () => loadSpreadsheet()

    expect(actual).toThrow('XLSX file path is required')
  })
})

describe('#getSheetData', () => {
  const getSheetData = transform.__get__('getSheetData')

  it('should throw for invalid workbook', () => {
    const actual = () => getSheetData(workbookMock)
    expect(actual).toThrow('sheetName is required')
  })

  it('should throw for invalid sheet', () => {
    const actual = () => getSheetData(workbookMock, 'invalid')
    expect(actual).toThrow('\'invalid\' sheet is not found in the workbook')
  })

  it('should return data for selected sheet of the workbook', () => {
    const actual = getSheetData(workbookMock, 'Sheet name')
    expect(actual).toHaveLength(5)
    expect(actual[0]).toEqual(['Heading'])
    expect(actual[1]).toHaveLength(3)
  })
})

describe('#getPeriodsRowIndex', () => {
  const getPeriodsRowIndex = transform.__get__('getPeriodsRowIndex')

  it('should return null when no sheet data is given', () => {
    expect(getPeriodsRowIndex()).toEqual(null)
    expect(getPeriodsRowIndex({})).toEqual(null)
    expect(getPeriodsRowIndex([])).toEqual(null)
  })

  it('should return index of the periods row', () => {
    expect(getPeriodsRowIndex(mockSheetData)).toEqual(2)
  })
})

describe('#getPeriodData', () => {
  const getPeriodData = transform.__get__('getPeriodData')

  afterEach(() => {
    transform.__ResetDependency__('getPeriodsRowIndex')
  })

  it('should return null if period index can’t be found', () => {
    transform.__set__('getPeriodsRowIndex', () => -1)
    expect(getPeriodData([])).toEqual(null)
  })

  it('should return null if period index can’t be found', () => {
    transform.__set__('getPeriodsRowIndex', () => 2)
    expect(getPeriodData(mockSheetData)).toEqual(mockPeriodData)
  })
})


describe('#sheetArrayToObjectXf', () => {
  const sheetArrayToObjectXf = transform.__get__('sheetArrayToObjectXf')

  it('should transform periods data array into object', () => {
    expect(sheetArrayToObjectXf(mockPeriodData)).toMatchSnapshot()
  })
})

describe('#saveToJson', () => {
  const saveToJson = transform.__get__('saveToJson')
  const fs = transform.__get__('fs')

  it('should save data to file', () => {
    saveToJson('my-file', { ok: true })
    expect(fs.writeFileSync).toBeCalledWith(
      'static/my-file.json',
      expect.stringContaining('"ok": true'),
    )
  })
})

describe('#buildJsonFromWorkbookSheets', () => {
  const buildJsonFromWorkbookSheets = transform.__get__('buildJsonFromWorkbookSheets')
  const fs = transform.__get__('fs')

  it('should transform and save workbook to JSON', () => {
    buildJsonFromWorkbookSheets(workbookMock, ['Sheet name'])

    const expected = JSON.stringify([
      {
        title: 'Heading',
        slug: 'heading',
        periods: {
          '2016/17': {
            items: {
              'Section #1': [
                2,
                4,
                6,
                8,
                10
              ]
            }
          }
        }
      }
    ], null, 2)

    expect(fs.writeFileSync).toBeCalledWith('static/metrics.json', expected)
  })
})
