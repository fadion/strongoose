import * as mongoose from 'mongoose'
import props from './props'

export type SchemaReadPreferences =
  'primary' | 'p' |
  'primaryPreferred' | 'pp' |
  'secondary' | 's' |
  'secondaryPreferred' | 'sp' |
  'nearest' | 'n'

export interface SchemaWriteConcern {
  w: string | number
  j: boolean
  wtimeout?: number
}

export interface SchemaShardKey {
  tag: number
  name: number
}

export interface SchemaToObject {
  getters?: boolean
  virtuals?: boolean
  minimize?: boolean
  transform?: (doc: mongoose.Document, ret: object, options: object) => object
  depopulate?: boolean
  versionKey?: boolean
}

export interface SchemaTimestamps {
  createdAt?: string
  updatedAt?: string
}

export interface SchemaOptions {
  autoIndex?: boolean
  autoCreate?: boolean
  bufferCommands?: boolean
  capped?: number
  collection?: string
  id?: boolean
  _id?: boolean
  minimize?: boolean
  read?: SchemaReadPreferences
  writeConcern?: SchemaWriteConcern
  shardKey?: SchemaShardKey
  strict?: boolean
  strictQuery?: boolean
  toJSON?: SchemaToObject
  toObject?: SchemaToObject
  typeKey?: string
  validateBeforeSave?: boolean
  versionKey?: string
  collation?: object
  timestamps?: boolean | SchemaTimestamps
  useNestedStrict?: boolean
  selectPopulatedPaths?: boolean
  storeSubdocValidationError?: boolean
}

export const schema = (options?: SchemaOptions) => {
  return (target: any) => {
    const model = target.prototype.constructor.name as string
    props.schema[model] = options
  }
}