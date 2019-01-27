# Strongoose

Mongoose is great and all, but it makes for a subpar experience in Typescript. You need schemas, interfaces, and plain classes just for getters or instance methods. Strongoose streamlines all of that in single classes with just a few decorators. This project was inspired and makes heavy use of the implementation of [Typegoose](https://github.com/szokodiakos/typegoose), however builds upon its own ideas.

Simply put, you'll be defining intuitive models as these in no time:

```typescript
class User extends Strongoose {
  @field({ required: true })
  firstName: string

  @field({ required: true })
  lastName: string

  @field({ required: true, unique: true })
  email: string

  @field()
  password: string

  @field({ ref: Team })
  teams: Team[]

  @field()
  settings: Settings

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}

class Team extends Strongoose {
  @field()
  name: string
}

class Settings {
  @field()
  receiveEmails: boolean

  @field()
  receiveNotifications: boolean
}

const UserModel = new User().getModel(User)
const TeamModel = new Team().getModel(Team)
```

## Installation

Before installing, make sure you have [Mongoose](https://www.npmjs.com/package/mongoose) and [Reflect Metadata](https://www.npmjs.com/package/reflect-metadata) installed, both listed as `peerDependencies`.

```
$ npm install --save strongoose
```

## Field

The `@field` decorator accepts a plain object with any of the Mongoose options [listed in here](https://mongoosejs.com/docs/schematypes.html). As Strongoose automatically infers type information, there's no need to set a type manually. It works even for Mongoose-specific types, such as ObjectId or Decimal128.

```typescript
@field()
id: mongoose.Schema.Types.ObjectId
```

An overly complicated field would look like:

```typescript
@field({ required: true, unique: true, default: 'email@example.com', index: true, lowercase: true, validate: /(.+)@(.+)/ })
email: string
```

## Schema

The `@schema` operator is an optional object of schema-wide settings, [listed in here](https://mongoosejs.com/docs/api.html#schema_Schema). Typically, it may look like this:

```typescript
@schema({ collection: 'docs', timestamps: true, autoIndex: false })
class Document extends Strongoose {
  @field()
  title: string
}
```

## Virtual, Methods, and Statics

Mongoose supports them either via schema methods, or by passing a plain class to [Schema.loadClass](https://mongoosejs.com/docs/api.html#schema_Schema-loadClass). The latter is specifically problematic for Typescript, which has no idea of what `this` refers to or where are the field names coming from. Strongoose makes it as easy as defining methods.

```typescript
class Book extends Strongoose {
  @field()
  title: string

  @field()
  author: string

  get whole() {
    return `${this.author} - ${this.title}`
  }

  addIsbn(isbn: string) {
    return `${this.title}: ${isbn}`
  }

  static findByAuthor(author: string) {
    return this.find({ author })
  }
}
```

## References

References are handled by passing in a model as type, which automatically builds the correct schema: `{ type: mongoose.Schema.Types.ObjectId, ref: 'ModelName' }`. Returning to the firstmost example, the code below adds a reference to an array of `Team` on `User.teams`.

```typescript
class User extends Strongoose {
  @field({ ref: Team })
  teams: Team[]
}

class Team extends Strongoose {
  @field()
  name: string
}
```

The only ceveat is the `ref` option passed to `@field`, as it informs Strongoose that you're trying to build a reference, not a subdocument.

## Subdocuments

Subdocuments are handles as a simplified case of references. It still infers the schema from the type, but it doesn't expect a `ref` option and the subschema classes don't need to extend Strongoose or be initialized as a model. They're simply used to build the schema and aren't evaluated.

```typescript
class User extends Strongoose {
  @field()
  settings: Settings
}

class Settings {
  @field()
  receiveEmails: boolean

  @field()
  receiveNotifications: boolean
}
```

That's equivalent to this schema in Mongoose:

```javascript
const settingsSchema = new mongoose.Schema({
  receiveEmails: Boolean,
  receiveNotifications: Boolean
})

const userSchema = new mongoose.Schema({
  settings: settingsSchema
})
```

In the case of the `settings`, we don't really need `_id`s generated for the subdocument, something Mongoose does by default. We just need a plain object.

```typescript
class User extends Strongoose {
  @field({ _id: false })
  settings: Settings
}

class Settings {
  @field()
  receiveEmails: boolean

  @field()
  receiveNotifications: boolean
}
```

## Inheritance

Class inheritance can be exploited to compose schemas using shared fields that are built into the children. Although useful, overuse of inheritance may make your models more difficult to reason about.

```typescript
class Person extends Strongoose {
  @field({ required: true })
  name: string

  @field({ required: true, unique: true, index: true })
  email: string
}

class User extends Person {
  @field()
  avatar: string
}

class Friend extends Person {
  @field()
  private: boolean
}
```

Base classes need to extend Strongoose, even if they're not going to be used as concrete models. That way, children can inherit methods like `getModel()` or `setModel()`.

## Initializing Models

Before being usable as Mongoose models, Strongoose classes need to be initialized. This is done fairly easy using the `getModel()` method on instances:

```typescript
class User extends Strongoose {
  @field()
  name: string
}

const UserModel = new User().getModel(User)
```

The only parameter to `getModel` is the class itself, which helps in informing Typescript of static methods.

## Roadmap

Before going for version 1.0, I plan on at least these features:

- Support [Middleware](https://mongoosejs.com/docs/middleware.html).
- Support [Plugins](https://mongoosejs.com/docs/plugins.html).
- Support schema-wide [indexes](https://mongoosejs.com/docs/guide.html#indexes).
- Support Enums.
- Automated tests.
- Real-world testing on my own projects.