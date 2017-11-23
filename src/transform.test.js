const transform = require('./transform')


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
