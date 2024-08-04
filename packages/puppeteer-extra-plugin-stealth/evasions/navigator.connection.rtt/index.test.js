const test = require('ava')
const os = require('os')

const { vanillaPuppeteer, addExtra } = require('../../test/util')

const {
  getVanillaFingerPrint,
  getStealthFingerPrint
} = require('../../test/util')
const Plugin = require('.')

const fingerprintFn = page => page.evaluate('navigator.connection.rtt')

test('vanilla: matches real core count', async t => {
  const { pageFnResult } = await getVanillaFingerPrint(fingerprintFn)
  t.is(pageFnResult, os.cpus().length)
})

test('stealth: default is set to 50', async t => {
  const { pageFnResult } = await getStealthFingerPrint(Plugin, fingerprintFn)
  t.is(pageFnResult, 50)
})

test('stealth: will override value correctly', async t => {
  const { pageFnResult } = await getStealthFingerPrint(Plugin, fingerprintFn, {
    connectionRTT: 25
  })
  t.is(pageFnResult, 25)
})

test('stealth: does patch getters properly', async t => {
  const puppeteer = addExtra(vanillaPuppeteer).use(Plugin())
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  const results = await page.evaluate(() => {
    const hasInvocationError = (() => {
      try {
        // eslint-disable-next-line dot-notation
        Object['seal'](Object.getPrototypeOf(navigator.connection)['rtt'])
        return false
      } catch (err) {
        return true
      }
    })()
    return {
      hasInvocationError,
      toString: Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(navigator.connection),
        'rtt'
      ).get.toString()
    }
  })

  t.deepEqual(results, {
    hasInvocationError: true,
    toString: 'function get rtt() { [native code] }'
  })
})
