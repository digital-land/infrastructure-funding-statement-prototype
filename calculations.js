const reportingYearStart = new Date('2019-01-01')
const reportingYearEnd = new Date('2019-12-31')

const calculations = {
  communityInfrastructureLevy (json) {
    const cil = json.grouped.filter(row => {
      if (Object.keys(row).includes('developer-agreement-classification')) {
        return row['developer-agreement-classification'].toLowerCase() === 'cil'
      }
      return row['developer-agreement-type'].toLowerCase() === 'cil'
    })

    // CIL 1
    let cil1Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(agreement => {
      const startDate = new Date(agreement['start-date'])
      // If the agreement is within the current reporting year
      if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
        agreement.contributions.forEach(contribution => {
          // Add the agreement contribution amounts
          cil1Sum = parseInt(cil1Sum) + parseInt(contribution.amount)
        })
      }
    })

    json.calculations.push({
      value: cil1Sum,
      explanation: `The total value of CIL set out in all demand notices issued between ${reportingYearStart} and ${reportingYearEnd}`,
      legislation: 'Schedule 2, Section 1, bullet point a',
      type: 'cil'
    })

    // CIL 2
    let cil2Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(agreement => {
      agreement.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          const startDate = new Date(transaction['start-date'])
          // If the transaction was received within the reporting year
          if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
            if (transaction['contribution-funding-status'] === 'received') {
              cil2Sum = parseInt(cil2Sum) + parseInt(transaction.amount)
            }
          }
        })
      })
    })

    json.calculations.push({
      value: cil2Sum,
      explanation: `The total amount of CIL receipts between ${reportingYearStart} and ${reportingYearEnd}`,
      legislation: 'Schedule 2, Section 1, bullet point a',
      type: 'cil'
    })

    /* TODO: CIL 3 */

    // CIL 4
    let cil4Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(agreement => {
      agreement.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          if (transaction['contribution-funding-status'] === 'received') {

          }
        })
      })
    })

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(item => {
      item.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          const startDate = new Date(item['start-date'])
          // If the transaction is before the reporting year
          if (startDate < reportingYearStart) {
            // Add up all the received money
            if (transaction['contribution-funding-status'] === 'received') {
              cil4Sum = parseInt(cil4Sum) + parseInt(transaction.amount)
            }
          }
          // Take away all of the allocated money
          if (transaction['contribution-funding-status'] === 'allocated') {
            cil4Sum = parseInt(cil4Sum) - parseInt(transaction.amount)
          }
        })
      })
    })

    json.calculations.push({
      value: cil4Sum,
      explanation: `The total amount of CIL receipts before ${reportingYearStart} but which have not been allocated.`,
      legislation: 'Schedule 2, Section 1, bullet point c',
      type: 'cil'
    })

    // CIL 5
    let cil5Received = 0
    let cil5Allocated = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(item => {
      item.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          const startDate = new Date(item['start-date'])
          if (startDate < reportingYearStart) {
            if (transaction['contribution-funding-status'] === 'received') {
              cil5Received = parseInt(cil5Received) + parseInt(transaction.amount)
            }
          }
          if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
            if (transaction['contribution-funding-status'] === 'allocated') {
              cil5Allocated = parseInt(cil5Allocated) - parseInt(transaction.amount)
            }
          }
        })
      })
    })

    json.calculations.push({
      value: {
        received: cil5Received,
        allocated: cil5Allocated
      },
      explanation: `This is the amount of CIL we collected before ${reportingYearStart} that has been allocated for spending in this year.`,
      legislation: 'Schedule 2, Section 1, bullet point d',
      type: 'cil'
    })

    // CIL 6 (double check)
    let cil6Sum = 0
    let cilTotalCollected = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(item => {
      item.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          if (transaction['contribution-funding-status'] === 'received') {
            cilTotalCollected = parseInt(cilTotalCollected) + transaction.amount
          }

          const startDate = new Date(item['start-date'])
          if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
            if (transaction['contribution-funding-status'] === 'allocated') {
              cil6Sum = parseInt(cil6Sum) + parseInt(transaction.amount)
            }
            if (transaction['contribution-funding-status'] === 'spent') {
              cil6Sum = parseInt(cil6Sum) - parseInt(transaction.amount)
            }
          }
        })
      })
    })

    json.calculations.push({
      value: {
        sum: cil6Sum,
        total: cilTotalCollected
      },
      explanation: '',
      legislation: '',
      type: 'cil'
    })

    // CIL 7
    let cil7Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(item => {
      item.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          if (transaction['contribution-funding-status'] === 'spent') {
            cil7Sum = parseInt(cil7Sum) - parseInt(transaction.amount)
          }
        })
      })
    })

    json.calculations.push({
      value: cil7Sum,
      explanation: `This is the total amount of CIL we have spent between ${reportingYearStart} and ${reportingYearEnd}`,
      legislation: 'Schedule 1(e)',
      type: 'cil'
    })

    // CIL 8
    const cil8Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(item => {

    })

    json.calculations.push({
      value: cil8Sum,
      explanation: '',
      legislation: '',
      type: 'cil'
    })

    // CIL 9
    const cil9Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(item => {

    })

    json.calculations.push({
      value: cil9Sum,
      explanation: '',
      legislation: '',
      type: 'cil'
    })

    // CIL 10
    let cil10Sum = 0
    let cil10Spent = 0

    // (iii)the amount of CIL spent on administrative expenses
    // pursuant to regulation 61, and that amount expressed as a percentage
    // of CIL collected in that year in accordance with that regulation;

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(item => {
      const startDate = new Date(item['start-date'])
      // When the start date is in the current reporting year
      if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
        // Add together the amount of all of the contributions to be provided
        item.contributions.forEach(contribution => {
          contribution.transactions.forEach(transaction => {
            cil10Sum = parseInt(cil10Sum) + transaction.amount
          })
          if (contribution['contribution-purpose'] === 'cil-administration-costs') {
            contribution.transactions.forEach(transaction => {
              if (transaction['contribution-funding-status'] === 'spent') {
                cil10Spent = parseInt(cil10Spent) + transaction.amount
              }
            })
          }
        })
      }
    })

    // 20 / 40 * 100
    json.calculations.push({
      value: {
        collected: cil10Sum,
        spentOnAdmin: cil10Spent,
        percentage: (cil10Spent / cil10Sum) * 100
      },
      explanation: '',
      legislation: '',
      type: 'cil'
    })

    return json
  },
  section106 (json) {
    const s106 = json.grouped.filter(row => {
      if (Object.keys(row).includes('developer-agreement-classification')) {
        return row['developer-agreement-classification'].toLowerCase() === 's106'
      }
      return row['developer-agreement-type'].toLowerCase() === 's106'
    })

    // S106 1
    let s1061Sum = 0

    // For every S106 agreement in developer-agreement_*.csv
    s106.forEach(item => {
      const startDate = new Date(item['start-date'])
      // When the start date is in the current reporting year
      if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
        // Add together the amount of all of the contributions to be provided
        item.contributions.forEach(contribution => {
          s1061Sum = parseInt(s1061Sum) + parseInt(contribution.amount)
        })
      }
    })

    json.calculations.push({
      value: s1061Sum,
      explanation: `The total amount of money to be provided under any planning obligations which were entered between ${reportingYearStart} and ${reportingYearEnd}`,
      legislation: 'Schedule 2, Section 3, bullet point (a)',
      type: 's106'
    })

    // S106 2, 3, 4
    let s1062Purposes = []
    // For every S106 agreement in developer-agreement_*.csv
    s106.forEach(item => {
      // List all contribution purposes (should swap for actual register, but this will include mispelt stuff)
      item.contributions.forEach(contribution => {
        s1062Purposes.push(contribution['contribution-purpose'])
      })
    })

    s1062Purposes = [...new Set(s1062Purposes)].map(key => ({
      key,
      units: 0
    }))

    // For every S106 agreement in developer-agreement_*.csv
    s106.forEach(item => {
      const startDate = new Date(item['start-date'])
      // If the agreement was entered into in the reporting year
      if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
        item.contributions.forEach(contribution => {
          if (contribution.units.length) {
            // Add the unit amounts to each corresponding purpose
            s1062Purposes.map(purpose => {
              if (purpose.key === contribution['contribution-purpose']) {
                purpose.units = parseInt(purpose.units) + parseInt(contribution.units)
              }
            })
          }
        })
      }
    })

    json.calculations.push({
      value: s1062Purposes,
      explanation: 'Summary details of any non-monetary contributions to be provided under planning obligations which were entered into during the reported year',
      legislation: 'Schedule 2, Section 3, bullet point d, point i, ii',
      type: 's106'
    })

    // S106 5
    let s1065Sum = 0
    s106.forEach(item => {
      item.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          const startDate = new Date(transaction['start-date'])
          if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
            if (transaction['contribution-funding-stage'] === 'received') {
              s1065Sum = parseInt(s1065Sum) + parseInt(transaction.amount)
            }
          }
        })
      })
    })

    json.calculations.push({
      value: s1065Sum,
      explanation: `The total amount of money under any planning obligations which was received between ${reportingYearStart} and ${reportingYearEnd}`,
      legislation: 'Schedule 2, Section 3, bullet point b',
      type: 's106'
    })

    // S106 6
    let s1066Sum = 0

    s106.forEach(item => {
      item.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          const startDate = new Date(transaction['start-date'])
          if (startDate < reportingYearStart) {
            if (transaction['contribution-funding-stage'] === 'received') {
              s1066Sum = parseInt(s1066Sum) + parseInt(transaction.amount)
            }
            if (transaction['contribution-funding-stage'] === 'allocated') {
              s1066Sum = parseInt(s1066Sum) - parseInt(transaction.amount)
            }
          }
        })
      })
    })

    json.calculations.push({
      value: s1066Sum,
      explanation: `The total amount of money under any planning obligations which was received before ${reportingYearStart} which has not been allocated by the authority`,
      legislation: 'Schedule 2, Section 3, bullet point c',
      type: 's106'
    })

    // S106 7
    let s1067Sum = 0
    // For every S106 agreement in developer-agreement_*.csv
    s106.forEach(item => {
      // And for every contribution
      item.contributions.forEach(contribution => {
        // And for every transaction
        contribution.transactions.forEach(transaction => {
          const startDate = new Date(transaction['start-date'])
          // If the transaction falls within the current reporting year
          if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
            // Add together all of the allocated money
            if (transaction['contribution-funding-stage'] === 'allocated') {
              s1067Sum = parseFloat(s1067Sum) + parseFloat(transaction.amount)
            }
            // And remove all of the spent money
            if (transaction['contribution-funding-stage'] === 'spent') {
              s1067Sum = parseFloat(s1067Sum) - parseFloat(transaction.amount)
            }
          }
        })
      })
    })

    json.calculations.push({
      value: s1067Sum,
      explanation: `The total amount of money (received under any planning obligations) which was allocated but not spent between ${reportingYearStart} and ${reportingYearEnd}`,
      legislation: 'Schedule 2, Section 3, bullet point e',
      type: 's106'
    })

    // S106 8
    let s1068Purposes = []
    // For every S106 agreement in developer-agreement_*.csv
    s106.forEach(item => {
      // List all contributions (should swap for actual register, but this will include mispelt stuff)
      item.contributions.forEach(contribution => {
        s1068Purposes.push(contribution['contribution-purpose'])
      })
    })

    s1068Purposes = [...new Set(s1068Purposes)].map(key => ({
      key,
      amount: 0
    }))

    // For every S106 agreement in developer-agreement_*.csv
    s106.forEach(item => {
      item.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          // For every allocated transaction
          const startDate = new Date(transaction['start-date'])
          // Within the current repoting year
          if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
            s1068Purposes.map(purpose => {
              // Add it together in the purpose key
              if (purpose.key === contribution['contribution-purpose']) {
                if (transaction['contribution-funding-stage'].toLowerCase() === 'allocated') {
                  purpose.amount = parseInt(purpose.amount) + parseInt(transaction.amount)
                }
                if (transaction['contribution-funding-stage'].toLowerCase() === 'spent') {
                  purpose.amount = parseInt(purpose.amount) - parseInt(transaction.amount)
                }
              }
              return purpose
            })
          }
        })
      })
    })

    json.calculations.push({
      value: s1068Purposes,
      explanation: 'In relation to money (received under planning obligations) which was allocated by the authority but not spent during the reported year, summary details of the items of infrastructure on which the money has been allocated, and the amount of money allocated to each item',
      legislation: 'Schedule 2, Section 3, bullet point g',
      type: 's106'
    })

    // S106 9
    /* This is for longer term maintenance, no data provided */

    // S106 10
    let s10610Sum = 0
    // For every S106 agreement in developer-agreement_*.csv
    s106.forEach(item => {
      item.contributions.forEach(contribution => {
        // For every transaction
        contribution.transactions.forEach(transaction => {
          // If it's been spent
          if (transaction['contribution-funding-stage'].toLowerCase() === 'spent') {
            // const startDate = new Date(transaction['start-date'])
            // In the current reporting year
            // if (startDate >= reportingYearStart && startDate <= reportingYearEnd) { // to check
            // Add it together
            s10610Sum = parseInt(s10610Sum) + parseInt(transaction['amount'])
            // }
          }
        })
      })
    })

    json.calculations.push({
      value: s10610Sum,
      explanation: 'The total amount of money (received under any planning obligations) which was spent by the authority',
      legislation: 'Schedule 2, Section 3, bullet point f',
      type: 's106'
    })

    // S106 11, 12, 13
    let s10611Purposes = []
    // For every S106 agreement in developer-agreement_*.csv
    s106.forEach(item => {
      // List all contributions (should swap for actual register, but this will include mispelt stuff)
      item.contributions.forEach(contribution => {
        s10611Purposes.push(contribution['contribution-purpose'])
      })
    })

    s10611Purposes = [...new Set(s10611Purposes)].map(key => ({
      key,
      amount: 0
    }))

    // For every S106 agreement in developer-agreement_*.csv
    s106.forEach(item => {
      item.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          // For every spent transaction
          if (transaction['contribution-funding-stage'].toLowerCase() === 'spent') {
            const startDate = new Date(transaction['start-date'])
            // Within the current repoting year
            if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
              s10611Purposes.map(purpose => {
                // Add it together in the purpose key
                if (purpose.key === contribution['contribution-purpose']) {
                  purpose.amount = parseInt(purpose.amount) + parseInt(transaction.amount)
                }
                return purpose
              })
            }
          }
        })
      })
    })

    json.calculations.push({
      value: s10611Purposes,
      explanation: 'The items of infrastructure on which that money (received under planning obligations) was spent, and the amount spent on each item',
      legislation: 'Schedule 2, Section 3, bullet point h, point i, ii, iii',
      type: 's106'
    })

    return json
  }
}

module.exports = calculations
