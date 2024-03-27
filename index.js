const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let bodyParser = require("body-parser")

app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const d = {}

app.post('/api/users', (req,res) =>{

  let uname = req.body.username

  for (const temp_idx in d){
    if (d[temp_idx]['username']==uname){
      res.json({
        username: uname,
        _id: temp_idx
      })
    }
  }

  let idx = Object.keys(d).length

  d[idx] = {
    '_id': idx,
    'username': uname,
    'count': 0,
    'log': []
  }

  res.json({
    username: uname,
    _id: idx
  })

})

app.get('/api/users', (req,res) => {

  let res_arr = []

  for (const temp_idx in d){
    res_arr.push({
      '_id': temp_idx,
      'username': d[temp_idx]['username']
    })
  }

  res.status(200).send(res_arr)

})


app.post('/api/users/:_id/exercises', (req, res)=>{

  let idx = req.params._id
  let desc = req.body.description
  let dur = Number(req.body.duration)
  let dat = req.body.date

  if (!dat){
    dat = new Date(Date.now()).toDateString()
  }
  else{
    dat = new Date(dat).toDateString()
  }

  d[idx]['count'] += 1
  d[idx]['log'].push({
    description: desc,
    duration: dur,
    date: dat
  })

  res.json({
    _id: idx,
    username: d[idx]['username'],
    date: dat,
    duration: dur,
    description: desc
  })

})


app.get('/api/users/:_id/logs', (req, res)=>{

  let idx = req.params._id
  let from = Date.parse(req.query.from)
  let to = Date.parse(req.query.to)
  let limit = Number(req.query.limit)

  if (!from){
    from = Date.parse(new Date(0).toDateString())
  }
  if (!to){
    to = Date.parse(new Date(Date.now()).toDateString())
  }
  if (!limit){
    limit = d[idx]['log'].length
  }


  let temp_candidates = d[idx]['log'].filter((curr_log)=>{
    const curr_log_date = Date.parse(curr_log['date'])

    if (curr_log_date>=from && curr_log_date<=to){
      return true
    }
    else{
      return false
    }

  })

  res.json({
    _id: idx,
    username: d[idx]['username'],
    count: temp_candidates.slice(0, limit).length,
    log: temp_candidates.slice(0, limit)
  })

})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
