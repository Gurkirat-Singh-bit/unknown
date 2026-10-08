import { Hono } from 'hono'
import * as cheerio from 'cheerio'
import { url } from 'inspector/promises'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.get('/scrape', async (c) => {
   const response = await fetch("https://hacktoberfest.com/")
   const html = await response.text()
   const $ = cheerio.load(html)
   const text = $('h1').text()

   return  c.json({ text })
   })


   export default app 
