/**
 * 
 * @param fileData 
 */
export default function parseTransactionFile (file) {
  if (file.name.endsWith('.qfx')) {
    return parseQfx(file)
  } else if (file.name.endsWith('.csv')) {
    return parseCsv(file)
  }
}

/**
 * Parse a .csv file
 * The first line will be the column names
 * CSV files don't offer FI or account info, only transactions
 */
async function parseCsv (file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      const lines = fileReader.result.replaceAll('"', '').split('\n')
      const parsedData = {}
      // The first line contains the headers
      parsedData.csvHeaders = lines.shift().toLowerCase().split(',')
      parsedData.transactions = lines.map(csvLine => {
        return csvLine.split(',').reduce((trx, csvCell, index) => {
          trx[parsedData.csvHeaders[index]] = csvCell
          return trx
        }, {})
      })
      resolve(parsedData)
    }
    fileReader.onerror = (e) => {
      reject(e)
    }
    fileReader.readAsText(file)
  })
}

/**
 * Parse a .qfx file to return the contained data
 * @returns {
 *   headers: file metadata (unused so far but kept just in case)
 *   account: {
 *     id: ID of this account
 *     org: name of the FI
 *     fid: FID of the FI (currently unused)
 *   }
 *   transactions: []
 * }
 */
async function parseQfx(file) {
  return new Promise ((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      const parsedData = {}
      const splitString = fileReader.result.split('<OFX>')
      const qfxTree = parseQfxTreeFromSgml('<OFX>' + splitString[1])

      // Parse useful data from qfx tree
      parsedData.headers = parseFileHeaders(splitString[0])
      parsedData.account = {
        id: qfxTree.querySelector('CCACCTFROM').textContent.trim(),
        org: qfxTree.querySelector('FI ORG').textContent.trim(),
        fid: qfxTree.querySelector('FI FID').textContent.trim(),
      }
      parsedData.transactions = []
      qfxTree.querySelectorAll('BANKTRANLIST STMTTRN').forEach(trxNode => {
        parsedData.transactions.push({
          fitid: trxNode.querySelector('FITID').textContent.trim(),
          date: parseDateFromString(trxNode.querySelector('DTPOSTED').textContent.trim()),
          type: trxNode.querySelector('TRNTYPE').textContent.trim(),
          amount: trxNode.querySelector('TRNAMT').textContent.trim(),
          name: trxNode.querySelector('NAME').textContent.trim(),
          memo: trxNode.querySelector('MEMO').textContent.trim(),
        })
      })
      resolve(parsedData)
    }
    fileReader.onerror = (e) => {
      reject(e)
    }
    fileReader.readAsText(file)
  })
}

function parseFileHeaders (fileString) {
  const headers = {}
  fileString.split(/\r?\n/).forEach(headerLine => {
    if (headerLine) {
      const headerData = headerLine.split(':')
      headers[headerData[0]] = headerData[1]
    }
  })
  return headers
}
function parseQfxTreeFromSgml (fileString) {
  const convertedToXml = fileString.replaceAll(/^\s*<([\w|\.]+)>([^<]+)$/mg, '<$1>$2</$1>')
  return new DOMParser().parseFromString(convertedToXml, 'application/xml')
}

function parseDateFromString (string) {
  // return new Date(`${string.substr(0, 4)}-${string.substr(4, 2)}-${string.substr(6, 2)}T${string.substr(8, 2)}:${string.substr(10, 2)}:${string.substr(12, 2)}`)
  return `${string.substr(0, 4)}-${string.substr(4, 2)}-${string.substr(6, 2)}`
}
