const express = require('express')
const multer = require('multer')
const router = express.Router()
const upload = multer({ dest: 'uploads/' })

const calculations = require('./ifs-generation/calculations.js')
const utilities = require('./ifs-generation/utilities.js')

var dcUploads = upload.fields([{ name: 'file-upload-1', maxCount: 1 }, { name: 'file-upload-2', maxCount: 1 }, { name: 'file-upload-3', maxCount: 1 }])

// Add your routes here - above the module.exports line
router.post('/generate', dcUploads, (req, res, next) => {
  console.log(req.files)

  utilities.parseCsvs({
    agreement: req.files['file-upload-1'][0].path,
    contributions: req.files['file-upload-2'][0].path,
    transactions: req.files['file-upload-3'][0].path
  }).then(calculations.section106).then(calculations.communityInfrastructureLevy).then(json => {
    return json
  }).then(utilities.writeFile).then(function (filename) {
    return res.render('output', { filename: filename })
  })
})

module.exports = router
