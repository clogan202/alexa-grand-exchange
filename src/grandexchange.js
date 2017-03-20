'use strict'
const request = require('request')
const natural = require('natural')

const itemIDS = require('./rs07_item_ids')

const RS_API_ENDPOINT = 'http://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item='

module.exports = {
  getItemPrice: function(itemSlotName, cb) {
    let itemName = fuzzymatch(itemIDS, itemSlotName)
    let itemID = itemIDS[itemName]
    getItemAPI(itemID, function(item) {
      cb(item['current']['price'])
    })
  }
}

function getItemAPI(itemID, cb) {
  request.get({url: RS_API_ENDPOINT + itemID, json: true})
      .on('data', function(data) {
        let itemData = JSON.parse(data.toString('utf-8'))['item']
        cb(itemData)
      })
      .on('error', function(err) {
        console.log('Error:', err)
      })
}


// getItemAPI('4151', (itemPrice) => console.log('Item Price:', itemPrice))
module.exports.getItemPrice('abyssal whip', price => console.log('The price:', price))

function fuzzymatch(lookuptable, searchword) {
  let metaphone = natural.Metaphone
  let dm = natural.DoubleMetaphone
  let encoding = dm.process('Matrix')
  metaphone.attach()
  // console.log(metaphone.compare('cole', 'clay'))

  let itemNames = Object.keys(lookuptable)
  let soundAlike = []
  for (let i = 0; i < itemNames.length; ++i) {
    let item = itemNames[i]
    let alike = metaphone.compare(item, searchword)
    if (alike) {
      soundAlike.push(item)
    }
  }

  // If we dont find any words that sound alike look for edit distance on
  // all items.
  if (!soundAlike.length) {
    soundAlike = itemNames
  }
  let minItem = soundAlike[0]
  let minDistance = natural.LevenshteinDistance(minItem, searchword)
  for (let i = 1; i < soundAlike.length; ++i) {
    let dist = natural.LevenshteinDistance(soundAlike[i], searchword)
    if (dist < minDistance) {
      minItem = soundAlike[i]
      minDistance = dist
    }
  }
  return minItem
}