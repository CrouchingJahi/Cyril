import Loki from 'lokijs'
import { app } from 'electron'
import path from 'path'
import lokiCryptedFileAdapter from 'lokijs/src/loki-crypted-file-adapter'

export class Account {
  constructor (id) {
    this.id = id
    this.transactions = []
  }
}

export class Transaction {
  constructor (properties) {
    this.id = properties.id // string
    this.name = properties.name // string
    this.memo = properties.memo // string
    this.date = properties.date // date
    this.type = properties.type // string
    this.amount = properties.amount // float
    this.category = properties.category // object (category type)
  }
}

class DBC {
  constructor (options={}) {
    let cb = () => {
      let collectionOptions = {
        unique: ['id'],
        indices: ['id']
      }
      this.accounts = this.findCollection('accounts', collectionOptions)
      console.log('Database initialized.')
    }

    let dataPath = process.env['CYRIL_ENV'] == 'manual' ? '/Users/jcrouch/Library/Application Support/' : app.getPath('appData')
    this.path = path.join(dataPath, 'Cyril', 'cyril.db')
    lokiCryptedFileAdapter.setSecret(options.secret || this.path)
    this.data = new Loki(this.path, Object.assign({
      adapter: lokiCryptedFileAdapter,
      autoload: true,
      autoloadCallback: cb,
      autosave: true
    }, options))
  }

  findCollection (name, opts) {
    return this.data.getCollection(name) || this.data.addCollection(name, opts)
  }

  getAccount (id) {
    return this.accounts.findOne({id}) || this.accounts.insert(new Account(id))
  }

  getAccounts () {
    return this.accounts.find()
  }

}

export default new DBC()
