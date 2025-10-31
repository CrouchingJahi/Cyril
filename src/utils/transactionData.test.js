import { describe, it, expect } from 'vitest'
import { createTransactionData } from './transactionData'
import { getDefaultCategories } from '../defaults/defaultCategories'
import * as mox from '../defaults/testValues'

describe('createTransactionData function', () => {

  describe('with empty data', () => {
    const trx = []
    const cats = []

    it('returns a base object wih 0 total and empty hierarchy', () => {
      const expectedData = {
        total: 0,
        timeframe: {},
        hierarchy: {
          name: 'Total',
          children: [],
        }
      }
      expect(createTransactionData(trx, cats)).toMatchObject(expectedData)
    })
  })

  describe('with a single root category', () => {
    const trx = mox.trxBasic.slice()
    const cats = mox.catJustRoot.slice()

    it('returns a proper category hierarchy', () => {
      let expectedData = {
        total: 0,
        timeframe: {
          start: '2020-02-20',
          end: '2020-02-20',
        },
        hierarchy: {
          name: 'Total',
          children: [{
            name: 'Unit Testing',
            catId: 'foo',
          }]
        },
      }
      let result = createTransactionData(trx, cats)
      expect(result).toMatchObject(expectedData)
    })
  })

  describe('with default categories', () => {
    const cats = getDefaultCategories()

    describe('and a single transaction', () => {
      const trx = mox.trxSingleBill.slice()

      it('returns total, timeframe of the trx date, and properly built category hierarchy', () => {
        let expectedData = {
          total: 123.45,
          timeframe: {
            start: '2000-01-01',
            end: '2000-01-01',
          },
          hierarchy: {
            name: 'Total',
            children: [{
              name: 'Housing',
              catId: '1',
              children: [{
                name: 'Repairs',
                catId: '14',
              }]
            }],
          }
        }
        let result = createTransactionData(trx, cats)
        expect(result).toMatchObject(expectedData)
      })
    })

    describe('and 2 transactions a day apart', () => {
      const trx = mox.trxNarrowDateRange.slice()

      it('will properly show the date range', () => {
        let expectedData = {
          total: 20,
          timeframe: {
            start: '2000-01-01',
            end: '2000-01-02',
          }
        }
        expect(createTransactionData(trx, cats)).toMatchObject(expectedData)
      })
    })

    describe('and 2 transactions a month minus a day apart', () => {
      const trx = mox.trxMediumDateRange.slice()

      it('will properly show the date range', () => {
        let expectedData = {
          total: 20,
          timeframe: {
            start: '2000-01-02',
            end: '2000-02-01',
          }
        }
        expect(createTransactionData(trx, cats)).toMatchObject(expectedData)
      })
    })

    describe('and 2 transactions years apart', () => {
      const trx = mox.trxWideDateRange.slice()

      it('will properly show the date range', () => {
        let expectedData = {
          total: 20,
          timeframe: {
            start: '2000-01-01',
            end: '2025-10-01',
          }
        }
        expect(createTransactionData(trx, cats)).toMatchObject(expectedData)
      })
    })
  })

  describe('with a deeply nested category', () => {
    const trx = mox.trxDeepCat.slice()
    const cats = mox.catDeepHierarchy.slice()

    it('returns total, timeframe of the trx date, and properly built category hierarchy', () => {
      let expectedData = {
        total: 505.05,
        timeframe: {
          start: '1234-12-12',
          end: '1234-12-12',
        },
        hierarchy: {
          name: 'Total',
          children: [{
            name: 'Trunk',
            catId: '0',
            children: [{
              name: 'Still Trunk',
              catId: '1',
              children: [{
                name: 'Tall Trunk',
                catId: '2',
                children: [{
                  name: 'Limb',
                  catId: '3',
                  children: [{
                    name: 'Branch',
                    catId: '4',
                    children: [{
                      name: 'Leaf',
                      catId: '5',
                    }]
                  }]
                }]
              }]
            }]
          }]
        }
      }
      let result = createTransactionData(trx, cats)
      expect(result).toMatchObject(expectedData)
    })
  })
})
