const fs = require('fs')
const csv = require('csvtojson')
const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, AlignmentType, TableLayoutType } = require('docx')

const utilities = {
  intToMoney (int) {
    return `£${parseFloat(int).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
  },
  async parseCsvs (options) {
    const required = ['agreement', 'contributions', 'transactions']

    required.forEach(type => {
      if (!Object.keys(options).includes(type)) {
        throw new Error(`${type} not present in options`)
      }
    })

    await Promise.all(
      Object.keys(options).map(async key => {
        options[key] = await csv().fromFile(options[key])
      })
    )

    return utilities.groupCsvs(options)
  },
  groupCsvs (data) {
    data.grouped = data.agreement.map(agreementRow => {
      agreementRow.contributions = data.contributions.filter(contributionRow => agreementRow['developer-agreement'] === contributionRow['developer-agreement']).map(contribution => {
        // Give a contribution amount, units a value of 0 if it's empty
        contribution.amount = contribution.amount.length ? contribution.amount : 0
        contribution.units = contribution.units.length ? contribution.units : 0
        return contribution
      })

      agreementRow.contributions.map(contributionRow => {
        contributionRow.transactions = data.transactions.filter(transactionRow => contributionRow['developer-agreement-contribution'] === transactionRow['developer-agreement-contribution']).map(transaction => {
          // Give a transaction amount, units a value of 0 if it's empty
          transaction.amount = transaction.amount.length ? transaction.amount : 0
          transaction.units = transaction.units.length ? transaction.units : 0
          return transaction
        })
        return contributionRow
      })

      return agreementRow
    })

    // Add calculations array
    data.calculations = []

    // Add filename
    data.filename = data.agreement.find(agreement => agreement.organisation).organisation.replace(':', '-')

    data.organisation = data.agreement.find(agreement => agreement.organisation).organisation

    return data
  },
  generateTable (calculations, type) {
    const rows = [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            children: [new Paragraph({ text: 'Value' })]
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Explanation' })]
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Legislation' })]
          })
        ]
      })
    ].concat.apply([], (
      calculations.filter(item => item.type === type).map(calculation => {
        if (isNaN(parseFloat(calculation.value))) {
          return new TableRow({
            children: [
              new TableCell({
                children: calculation.value.map(value => {
                  let amount = Object.keys(value).includes('amount') ? utilities.intToMoney(value.amount) : `${value.units} units`
                  if (value.key === 'percentage') {
                    amount = `${value.amount}%`
                  }
                  return new Paragraph({ text: `${value.key}: ${amount}` })
                })
              }),
              new TableCell({
                children: [new Paragraph({ text: calculation.explanation })]
              }),
              new TableCell({
                children: [new Paragraph({ text: calculation.legislation })]
              })
            ]
          })
        }

        return new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: utilities.intToMoney(calculation.value) })]
            }),
            new TableCell({
              children: [new Paragraph({ text: calculation.explanation })]
            }),
            new TableCell({
              children: [new Paragraph({ text: calculation.legislation })]
            })
          ]
        })
      })
    ))

    return new Table({
      layout: TableLayoutType.AUTOFIT,
      rows
    })
  },
  writeFile (json) {
    const doc = new Document()

    doc.addSection({
      children: [
        new Paragraph({
          text: `DRAFT - Infrastructure Funding Statement for ${json.organisation}`,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: 'Community Infrastructure Levy calculations',
          heading: HeadingLevel.HEADING_1
        }),
        utilities.generateTable(json.calculations, 'cil'),
        new Paragraph({
          text: 'Section 106 calculations',
          heading: HeadingLevel.HEADING_1
        }),
        utilities.generateTable(json.calculations, 's106')
      ]
    })

    // Create and write the docx file
    return Packer.toBuffer(doc).then((buffer) => {
      fs.writeFileSync(`./outputs/${json.filename.toLowerCase()}.docx`, buffer)
      return `./outputs/${json.filename.toLowerCase()}.docx`
    })
  }
}

module.exports = utilities
