import { Transaction } from './dbc'
import { parse } from 'banking'

function dateOf (datestring) {
  let year = parseInt(datestring.slice(0, 4)),
      month = parseInt(datestring.slice(4, 6)) - 1,
      day = parseInt(datestring.slice(6, 8)),
      hour = parseInt(datestring.slice(8, 10)),
      minute = parseInt(datestring.slice(10, 12)),
      second = parseInt(datestring.slice(12, 14));
  
  return new Date(year, month, day, hour, minute, second);
}

//TODO There are multiple types of accounts in the OFX format. Somehow, a way will be needed to check CREDITCARDMSGSRSV1, or BANKMSGSRSV1, etc. for info
export default (file) => new Promise((resolve, reject) => {
  parse(file, parsed => {
    let data = parsed.body
    let transactions = data.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.STMTTRN
    .filter(trn => parseFloat(trn.TRNAMT) < 0)
    .map(trn => new Transaction({
      id: trn.FITID,
      name: trn.NAME,
      memo: trn.MEMO,
      date: dateOf(trn.DTPOSTED),
      type: trn.TRNTYPE,
      amount: Math.abs(parseFloat(trn.TRNAMT))
    }))

    resolve({
      bank: data.OFX.SIGNONMSGSRSV1.SONRS.FI.ORG,
      fid: data.OFX.SIGNONMSGSRSV1.SONRS.FI.FID,
      account: data.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.CCACCTFROM.ACCTID,
      startDate: dateOf(data.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.DTSTART),
      endDate: dateOf(data.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.DTEND),
      transactions: transactions
    })
  })
})
