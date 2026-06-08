/* eslint-disable camelcase */
const fs = require('fs')
const path = require('path')

const sqlDir = path.join(__dirname, '..', 'sql')
const readSql = (name) => fs.readFileSync(path.join(sqlDir, name), 'utf8')

exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.sql(readSql('init.up.sql'))
}

exports.down = (pgm) => {
  pgm.sql(readSql('init.down.sql'))
}
