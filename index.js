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

utilities.parseCsvs({
  agreement: './examples/sandwell/development-agreement_20191129.csv',
  contributions: './examples/sandwell/development-agreement-contribution_20191129.csv',
  transactions: './examples/sandwell/development-agreement-transaction-20191129.csv'
}).then(calculations.section106).then(calculations.communityInfrastructureLevy).then(json => {
  console.log(json.calculations)
  return json
}).then(utilities.writeFile)

utilities.parseCsvs({
  agreement: './examples/hambleton/development-agreement_20191129.csv',
  contributions: './examples/hambleton/development-agreement-contribution_20191129.csv',
  transactions: './examples/hambleton/development-agreement-transaction-20191129.csv'
}).then(calculations.section106).then(calculations.communityInfrastructureLevy).then(json => {
  console.log(json.calculations)
  return json
}).then(utilities.writeFile)
