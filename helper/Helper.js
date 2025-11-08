class Helper {
  static castValue(value, type) {
    let castedValue

    switch (type) {
      case 'string':
        castedValue = value.toString()
        break
      case 'number':
        castedValue = Number(value)
        if (isNaN(castedValue)) throw new Error(`Cannot cast '${value}' to number`)
        break
      case 'boolean':
        castedValue = Boolean(value)
        break
      default:
        castedValue = value
        break
    }

    return castedValue
  }
}

export default Helper
