import express from 'express'
import { SignJWT, jwtVerify } from 'jose'
import cookieParser from 'cookie-parser'
import { resolve } from 'path'

// constants
const secret = new TextEncoder().encode(
  'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2',
)

const alg = 'HS256'

// initialisation
const app = express()
app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('views', resolve())

app.get('/', (req, res) => {
  res.clearCookie('token')
  res.render(resolve() + '/main.ejs')
})

app.post('/login', async (req, res) => {
  const { username, password } = req.query

  const token = await new SignJWT({ username, password })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('10s')
    .sign(secret)
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  })

  res.redirect('/data')
})

app.get('/data', async (req, res) => {
  const token = req.cookies.token

  try {
    const { payload } = await jwtVerify(token, secret)
    res.render(resolve() + '/index.ejs', { username: payload.username })
  } catch {
    res.clearCookie('token')
    res.render(resolve() + '/forbidden.ejs')
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.render(resolve() + '/main.ejs')
})

app.listen(3000)
