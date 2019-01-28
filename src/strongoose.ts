import * as mongoose from 'mongoose'
import props from 'props'

export * from './errors'
export * from './field'
export * from './schema'

export type DocumentType<T> = mongoose.Document & T
export type ModelType<T> = mongoose.Model<DocumentType<T>> & T

export class Strongoose {
  getModel<T>(instance: T) {
    const name = this.constructor.name
    // Build and save the model so it can be reused
    // on subsequent requests.
    if (!props.models[name])
      this.setModel(instance)

    return props.models[name] as ModelType<this> & T
  }

  setModel<T>(instance: T) {
    const name = this.constructor.name
    let schema = this.buildSchema(name)
    let parent = Object.getPrototypeOf(this.constructor.prototype).constructor

    // Loops through the prototype chain to merge
    // parent schemas.
    while (parent && !['Strongoose', 'Object'].includes(parent.name)) {
      schema = this.buildSchema(parent.name, schema)
      parent = Object.getPrototypeOf(parent.prototype).constructor
    }

    props.models[name] = mongoose.model(name, schema)

    return props.models[name] as ModelType<this> & T
  }

  private buildSchema(name: string, schema?: mongoose.Schema) {
    schema
      ? schema.add(props.fields[name])
      : schema = new mongoose.Schema(props.fields[name], props.schema[name])

    const descriptors = Object.entries(Object.getOwnPropertyDescriptors(this.constructor.prototype))

    // Getters and setters
    descriptors
      .filter(([_, { get, set }]) => typeof get === 'function' || typeof set === 'function')
      .map(([field, { get, set }]) => ({ name: field, get, set }))
      .forEach(item => {
        if (item.get)
          schema.virtual(item.name).get(item.get)

        if (item.set)
          schema.virtual(item.name).set(item.set)
      })

    // Instance methods
    descriptors
      .filter(([field, { value }]) => typeof value === 'function' && field !== 'constructor')
      .map(([field, { value }]) => ({ name: field, function: value }))
      .forEach(item => {
        schema.methods[item.name] = item.function
      })

    // Statics
    Object.getOwnPropertyNames(this.constructor)
      .filter(field => !['length', 'prototype', 'name'].includes(field))
      .map(field => ({ name: field, function: this.constructor[field] }))
      .forEach(item => {
        schema.statics[item.name] = item.function
      })

    return schema
  }
}