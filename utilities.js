const fs = require('fs')
const csv = require('csvtojson')
const { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, TableLayoutType } = require('docx')

const utilities = {
  intToMoney (int) {
    if (isNaN(parseFloat(int))) {
      return JSON.stringify(int, null, 4)
    }
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
      agreementRow.contributions = data.contributions.filter(contributionRow => agreementRow['developer-agreement'] === contributionRow['developer-agreement'])

      agreementRow.contributions.map(contributionRow => {
        contributionRow.transactions = data.transactions.filter(transactionRow => contributionRow['developer-agreement-contribution'] === transactionRow['developer-agreement-contribution'])
        return contributionRow
      })

      return agreementRow
    })

    // Add calculations array
    data.calculations = []

    // Add filename
    data.filename = data.agreement.find(agreement => agreement.organisation).organisation.replace(':', '-')

    return data
  },
  generateTable (calculations, type) {
    const heading = [new TableRow({
      tableHeader: true,
      children: [
        new TableCell({
          children: [new Paragraph('Value')],
          size: 33,
          type: WidthType.PERCENTAGE
        }),
        new TableCell({
          children: [new Paragraph('Explanation')],
          size: 33,
          type: WidthType.PERCENTAGE
        }),
        new TableCell({
          children: [new Paragraph('Legislation')],
          size: 33,
          type: WidthType.PERCENTAGE
        })
      ]
    })]

    const rows = calculations.filter(item => item.type === type).map(calculation => new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(utilities.intToMoney(calculation.value))]
        }),
        new TableCell({
          children: [new Paragraph(calculation.explanation)]
        }),
        new TableCell({
          children: [new Paragraph(calculation.legislation)]
        })
      ]
    }))

    return new Table({
      width: {
        size: 4535,
        type: WidthType.DXA
      },
      layout: TableLayoutType.FIXED,
      rows: heading.concat(rows)
    })
  },
  writeFile (json) {
    const doc = new Document()

    doc.addSection({
      children: [
        new Paragraph({
          text: 'Infrastructure Funding Statement for XYZ',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({
          text: 'Section 106 calculations',
          heading: HeadingLevel.HEADING_2
        }),
        utilities.generateTable(json.calculations, 's106'),
        new Paragraph({
          text: 'Community Infrastructure Levy calculations',
          heading: HeadingLevel.HEADING_2
        }),
        utilities.generateTable(json.calculations, 'cil')
      ]
    })

    // Create and write the docx file
    return Packer.toBuffer(doc).then((buffer) => {
      fs.writeFileSync(`${json.filename.toLowerCase()}.docx`, buffer)
    })
  }
}

module.exports = utilities
