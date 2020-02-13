const reportingYearStart = new Date('2019-01-01')
const reportingYearEnd = new Date('2019-12-31')

const calculations = {
  communityInfrastructureLevy (json) {
    const cil = json.grouped.filter(row => {
      if (Object.keys(row).includes('developer-agreement-classification')) {
        return row['developer-agreement-classification'].toLowerCase() === 'cil'
      }
      return row['developer-agreement-type'].toLowerCase() === 'cil'
    }).filter(row => !row['end-date'].length)

    // CIL 1
    let cil1Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(agreement => {
      const startDate = new Date(agreement['start-date'])
      // If the agreement is within the current reporting year
      if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
        agreement.contributions.forEach(contribution => {
          // Add the agreement contribution amounts
          cil1Sum = parseFloat(cil1Sum) + parseFloat(contribution.amount)
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
              cil2Sum = parseFloat(cil2Sum) + parseFloat(transaction.amount)
            }
          }
        })
      })
    })

    json.calculations.push({
      value: cil2Sum,
      explanation: `The total amount of CIL received between ${reportingYearStart} and ${reportingYearEnd}`,
      legislation: 'Schedule 2, Section 1, bullet point b',
      type: 'cil'
    })

    let cil4Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(agreement => {
      agreement.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          const startDate = new Date(transaction['start-date'])
          // If the transaction is before the reporting year
          if (startDate < reportingYearStart) {
            // Add all of the received amounts together
            if (transaction['contribution-funding-status'] === 'received') {
              cil4Sum = parseFloat(cil4Sum) + parseFloat(transaction['amount'])
            }
            // Subtract all of the allocated amounts
            if (transaction['contribution-funding-status'] === 'allocated') {
              /* TODO: Check if the allocation removal includes the current year, rather than only BEFORE */
              cil4Sum = parseFloat(cil4Sum) - parseFloat(transaction['amount'])
            }
          }
        })
      })
    })

    json.calculations.push({
      value: cil4Sum,
      explanation: `The total amount of CIL receipts before ${reportingYearStart} but which was not allocated before ${reportingYearStart}.`,
      legislation: 'Schedule 2, Section 1, bullet point c',
      type: 'cil'
    })

    // CIL 5
    let cil5Received = 0
    let cil5Allocated = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(agreement => {
      agreement.contributions.forEach(contribution => {
        // If a contributions is both received, and allocated
        const isReceived = contribution.transactions.find(transaction => transaction['contribution-funding-status'] === 'received') || false
        const isAllocated = contribution.transactions.find(transaction => transaction['contribution-funding-status'] === 'allocated') || false

        if (isReceived && isAllocated) {
          const receivedStartDate = new Date(isReceived['start-date'])
          const allocatedStartDate = new Date(isAllocated['start-date'])

          // And the receipt was before the reporting year start
          if (receivedStartDate < reportingYearStart) {
            // Add it together
            cil5Received = parseFloat(cil5Received) + parseFloat(isReceived.amount)
          }

          // And the allocation was within the reporting year
          if (allocatedStartDate >= reportingYearStart && allocatedStartDate <= reportingYearEnd) {
            // Add it all together
            cil5Allocated = parseFloat(cil5Allocated) + parseFloat(isAllocated.amount)
          }
        }
      })
    })

    json.calculations.push({
      value: {
        received: cil5Received,
        allocated: cil5Allocated
      },
      explanation: `This is the amount of CIL received before ${reportingYearStart}, and how much of that was allocated between ${reportingYearStart} and ${reportingYearEnd}.`,
      legislation: 'Schedule 2, Section 1, bullet point d',
      type: 'cil'
    })

    // CIL 7
    let cil7Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(agreement => {
      agreement.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          // For every contribution transaction within the reporting year
          const startDate = new Date(transaction['start-date'])
          if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
            // That has been spent, add it together
            if (transaction['contribution-funding-status'] === 'spent') {
              cil7Sum = parseFloat(cil7Sum) + parseFloat(transaction.amount)
            }
          }
        })
      })
    })

    json.calculations.push({
      value: cil7Sum,
      explanation: `This is the total amount of CIL we have spent between ${reportingYearStart} and ${reportingYearEnd}`,
      legislation: 'Schedule 2, Section 1, bullet point e',
      type: 'cil'
    })

    // CIL 6
    let cil6Sum = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(agreement => {
      agreement.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          const startDate = new Date(transaction['start-date'])
          // If the transaction is before the reporting year
          if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
            // Add all of the received amounts together
            if (transaction['contribution-funding-status'] === 'allocated') {
              cil6Sum = parseFloat(cil6Sum) + parseFloat(transaction['amount'])
            }
            // Subtract all of the spent amounts
            if (transaction['contribution-funding-status'] === 'spent') {
              /* TODO: Check if the allocation removal includes the current year, rather than only BEFORE */
              cil6Sum = parseFloat(cil6Sum) - parseFloat(transaction['amount'])
            }
          }
        })
      })
    })

    json.calculations.push({
      value: cil6Sum,
      explanation: `The total amount of CIL received at any time, which was allocated but not spent between ${reportingYearStart} and ${reportingYearEnd}`,
      legislation: 'Schedule 2, Section 1, bullet point f',
      type: 'cil'
    })

    // CIL 8, 9, 10
    /*
      NOTE: We can't break down the infrastructure spend, as we don't know what it is.
      We can split them up into purposes, and then the LPA can split it further.
    */
    let cilPurposes = []
    // For every CIL agreement in developer-agreement_*.csv
    cil.forEach(agreement => {
      // List all contribution purposes (should swap for actual register, but this will include mispelt stuff)
      agreement.contributions.forEach(contribution => {
        cilPurposes.push(contribution['contribution-purpose'])
      })
    })

    cilPurposes = [...new Set(cilPurposes)].map(key => ({
      key,
      amount: 0
    }))

    // For every S106 agreement in developer-agreement_*.csv
    cil.forEach(agreement => {
      agreement.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          // For every spent transaction
          if (transaction['contribution-funding-status'].toLowerCase() === 'spent') {
            const startDate = new Date(transaction['start-date'])
            // Within the current repoting year
            if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
              cilPurposes.map(purpose => {
                // Add it together in the purpose key
                if (purpose.key === contribution['contribution-purpose']) {
                  purpose.amount = parseFloat(purpose.amount) + parseFloat(transaction.amount)
                }
                return purpose
              })
            }
          }
        })
      })
    })

    json.calculations.push({
      value: cilPurposes,
      explanation: `These are the categories of reported CIL spending within ${reportingYearStart} and ${reportingYearEnd}. These need to be broken down further into infrastructure spend.`,
      legislation: 'Schedule 2, Section 1, bullet point g, point i, ii',
      type: 'cil'
    })

    // CIL 10
    let cil10Received = 0
    let cil10Spent = 0

    // For every CIL agreement in developer-agreeement_*.csv
    cil.forEach(agreement => {
      agreement.contributions.forEach(contribution => {
        contribution.transactions.forEach(transaction => {
          const startDate = new Date(transaction['start-date'])
          if (startDate >= reportingYearStart && startDate <= reportingYearEnd) {
            if (transaction['contribution-funding-status'] === 'received') {
              cil10Received = parseFloat(cil10Received) + parseFloat(transaction['amount'])
            }
            if (transaction['contribution-funding-status'] === 'spent') {
              cil10Spent = parseFloat(cil10Spent) + parseFloat(transaction['amount'])
            }
          }
        })
      })
    })

    json.calculations.push({
      value: {
        received: cil10Received,
        spentOnAdmin: cil10Spent,
        percentage: (cil10Received !== 0) ? (cil10Spent / cil10Received) * 100 : 0
      },
      explanation: `The amount of CIL spent on administrative expenses pursuant to regulation 61, and that amount expressed as a percentage of CIL collected in that year in accordance with that regulation`,
      legislation: 'Schedule 2, Section 1, bullet point g, point iii',
      type: 'cil'
    })

    // CIL 3
    /*
      NOTE: We can't break down the infrastructure spend, as we don't know what it is.
      We can split them up into purposes, and then the LPA can split it further.
    */
    let cil3Purposes = []
    // For every CIL agreement in developer-agreement_*.csv
    cil.forEach(agreement => {
      // List all contribution purposes (should swap for actual register, but this will include mispelt stuff)
      agreement.contributions.forEach(contribution => {
        cil3Purposes.push(contribution['contribution-purpose'])
      })
    })

    cil3Purposes = [...new Set(cil3Purposes)].map(key => ({
      key,
      amount: 0
    }))

    cil.forEach(agreement => {
      agreement.contributions.forEach(contribution => {
        const isAllocated = contribution.transactions.find(transaction => transaction['contribution-funding-status'] === 'allocated') || false
        const isSpent = contribution.transactions.find(transaction => transaction['contribution-funding-status'] === 'spent') || false

        // If a contributions is allocated, but not spent
        if (isAllocated && !isSpent) {
          const allocatedStartDate = new Date(isAllocated['start-date'])

          // If it was allocated during the reporting year
          if (allocatedStartDate >= reportingYearStart && allocatedStartDate <= reportingYearEnd) {
            cil3Purposes.map(purpose => {
              // Add it together in the purpose key
              if (purpose.key === contribution['contribution-purpose']) {
                purpose.amount = parseFloat(purpose.amount) + parseFloat(isAllocated.amount)
              }
              return purpose
            })
          }
        }
      })
    })

    json.calculations.push({
      value: cil3Purposes,
      explanation: `This is CIL that has been allocated but not spent between ${reportingYearStart} and ${reportingYearEnd}, broken down by category`,
      legislation: 'Schedule 2, Section 1, bullet point h',
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
    }).filter(row => !row['end-date'].length)

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
