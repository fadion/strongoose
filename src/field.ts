import 'reflect-metadata'
import * as mongoose from 'mongoose'
import props from './props'
import { UnknownTypeError, ArrayMissingTypeError, UnsupportedTypeError, StringValidatorsError, NumberValidatorsError } from 'errors'
import { isSupportedType } from './util'

export type FieldValidatorFunction = (value: any) => boolean | Promise<boolean>
export type FieldValidator = FieldValidatorFunction | RegExp |
  { validator: FieldValidatorFunction, message?: string }

export type FieldRequiredFunction = (...args: any[]) => boolean
export type FieldDefaultFunction = (...args: any[]) => any

export interface FieldOptions {
  required?: boolean | FieldRequiredFunction
  default?: boolean | FieldDefaultFunction
  validate?: FieldValidator | FieldValidator[]
  select?: boolean
  alias?: string
  index?: boolean
  unique?: boolean
  sparse?: boolean
  lowercase?: boolean
  uppercase?: boolean
  trim?: boolean
  match?: RegExp
  enum?: object
  minlength?: number
  maxlength?: number
  min?: number | Date
  max?: number | Date
  type?: any
  ref?: object
  _id?: boolean
}

export const field = (options: FieldOptions = {}) => {
  return (target: any, key: string) => {
    const model = target.constructor.name as string
    // Get the real type with reflect-metadata.
    const reflect = Reflect.getMetadata('design:type', target, key)
    const isArray = reflect === Array

    if (!reflect)
      throw new UnknownTypeError(key)

    const type = options.type || options.ref || reflect

    // An array field expects an explicit type set
    // in the options.
    if (isArray && !type)
      throw new ArrayMissingTypeError(key)

    const instance = new type()
    const refFields = props.fields[instance.constructor.name]

    // It's either a reference or a known type.
    if (!refFields && !isSupportedType(type.name))
      throw new UnsupportedTypeError(key, type.name)

    const stringValidators = options.lowercase || options.uppercase || options.trim || options.match ||
      options.enum || options.minlength || options.maxlength
    const numberValidators = options.min || options.max

    // String validators should be present only on string types.
    if (type.name !== 'String' && stringValidators)
      throw new StringValidatorsError(key)

    // Number/Date validators should be present only on number or date types.
    if ((type.name !== 'Number' || type.name !== 'Date') && numberValidators)
      throw new NumberValidatorsError(key)

    let finalOptions: object | object[]

    // Add reference.
    if (options.ref && refFields) {
      finalOptions = {
        type: mongoose.Schema.Types.ObjectId,
        ref: instance.constructor.name
      }

      if (isArray) finalOptions = [finalOptions]
    // Sub document.
    } else if (refFields) {
      const keepId = options._id === true
      const subType = new mongoose.Schema(refFields, { _id: keepId })
      finalOptions = isArray ? [subType] : subType
    // Primitive fields.
    } else {
      options.type = isArray ? [type] : type
      delete options.ref
      delete options._id
      finalOptions = options
    }

    props.fields[model]
      ? props.fields[model][key] = finalOptions
      : props.fields[model] = { [key]: finalOptions } 
  }
}