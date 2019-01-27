export class UnknownTypeError extends Error {
  constructor(field: string) {
    super(`Could't read type information for "${field}".`)
  }
}

export class UnsupportedTypeError extends Error {
  constructor(field: string, type: string) {
    super(`Unsupported type "${type}" in "${field}".`)
  }
}

export class ArrayMissingTypeError extends Error {
  constructor(field: string) {
    super(`${field} is declared as an array, but it's missing type information.
      Set it as an option: @field({ type: String }).`)
  }
}

export class StringValidatorsError extends Error {
  constructor(field: string) {
    super(`${field} should be of type String to support string validators.`)
  }
}

export class NumberValidatorsError extends Error {
  constructor(field: string) {
    super(`${field} should be of type Number or Date to support number or date validators.`)
  }
}