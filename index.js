import express from 'express'
import cors from "cors"
import morgan from "morgan"
import fetch from "node-fetch"
import jwt from "jsonwebtoken"
const app = express()
const port = process.env.PORT || 5000
const APIKEY = process.env.API_KEY || "DEMO_KEY"
const SECRET = process.env.SECRET || "api-datagalaxy"

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// Basics
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/status', (req, res) => {
  res.sendStatus(200);
})

// Middleware
const checkTokenMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  // Présence d'un token
  if (!token) {
      return res.status(403).json({ message: 'Token expected' })
  }

  // Véracité du token
  jwt.verify(token, SECRET, (err, decodedToken) => {
    if (err) {
      res.status(401).json({ message: 'Incorrect token' })
    } else {
      return next()
    }
  })
}

// Features
app.post('/login', (req, res) => {
  console.log(req.body)
  if (!(req.body?.username && req.body?.password)) {
    return res.sendStatus(403);
  }
  if (req.body?.password === 'datascientest') {
    let token = jwt.sign({
      username: req.body.username
    }, SECRET, {
      issuer: 'DataScientest',
      expiresIn: "1d"
    });
    res.json({
      access_token: token
    })
  } else {
    return res.sendStatus(403);
  }
})

app.get('/data', checkTokenMiddleware, (req, res) => {
  let date = /^\d{4}-\d{2}-\d{2}$/.test(req.query?.date) ? req.query?.date : "2022-07-17"
  const URL = `https://api.nasa.gov/planetary/apod?api_key=${APIKEY}&date=${date}`;

  fetch(URL)
    .then(response => response.json())
    .then(resp => {
      const {explanation, title, url, hdurl} = resp;

      res.json({
        explanation,
        title,
        url,
        hdurl
      });
    })
    .catch(err => {
      console.error(err)
      res.sendStatus(400);
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
