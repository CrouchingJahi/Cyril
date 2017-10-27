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
      let collectionOptions = {}
      this.accounts = this.findCollection('accounts', Object.assign({ unique: ['id'], indices: ['id']}, collectionOptions))
      this.categorizations = this.accounts.getDynamicView('categorizations')
      if (!this.categorizations) {
        function mapFn (acct) {
          return acct.transactions.reduce((summary, transaction) => {
            let cat = transaction.categorization
            if (cat.group) {
              summary[cat.group] = summary[cat.group] || {}
              if (cat.category) {
                summary[cat.group][cat.category] = summary[cat.group][cat.category] || {}
                if (cat.subcategory) {
                  summary[cat.group][cat.category][cat.subcategory] = true
                }
              }
            }
            return summary
          }, {})
        }
        function reduceFn (summary = {}, accountSummary) {
          return Object.assign(summary, accountSummary)
        }
        this.categorizations = this.accounts.addDynamicView('categorizations', { persistent: true })
        this.categorizations.mapReduce(mapFn, reduceFn)
      }
      this.matchers = this.findCollection('matchers', collectionOptions)
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

  getCategorizations () {
    return this.categorizations.data()
  }

  getMatchers () {
    return this.matchers.find()
  }

  getMatcherFor (transaction) {
    return this.matchers.where((matcher) => transaction.name.match(matcher.term))
  }

  isCategoryUsed (category) {
    return this.accounts.findOne((acct) => {
      return !!acct.transactions.find((t) => {
        let cat = t.categorization
        return cat.category
      })
    })
  }
}

export default new DBC()
