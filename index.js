const calculations = require('./calculations.js')
const utilities = require('./utilities.js')

utilities.parseCsvs({
  agreement: './examples/adur-and-worthing/developer-agreement_20200128.csv',
  contributions: './examples/adur-and-worthing/developer-agreement-contribution_20200128.csv',
  transactions: './examples/adur-and-worthing/developer-agreement-transaction_20200129.csv'
}).then(calculations.section106).then(calculations.communityInfrastructureLevy).then(json => {
  console.log(json.calculations)
  return json
}).then(utilities.writeFile)
