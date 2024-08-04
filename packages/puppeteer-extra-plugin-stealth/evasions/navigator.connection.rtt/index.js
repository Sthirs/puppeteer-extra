'use strict'

const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')

const withUtils = require('../_utils/withUtils')

/**
 * Set the navigator.connection.rtt to 50 (optionally configurable with `connectionRTT`)
 *
 * @param {Object} [opts] - Options
 * @param {number} [opts.connectionRTT] - The value to use in `navigator.connectionRTT` (default: `50`)
 */

class Plugin extends PuppeteerExtraPlugin {
  constructor(opts = {}) {
    super(opts)
  }

  get name() {
    return 'stealth/evasions/navigator.connection.rtt'
  }

  get defaults() {
    return {
      connectionRtt: 50
    }
  }

  async onPageCreated(page) {
    await withUtils(page).evaluateOnNewDocument(
      (utils, { opts }) => {
        utils.replaceGetterWithProxy(
          Object.getPrototypeOf(navigator.connection),
          'rtt',
          utils.makeHandler().getterValue(opts.connectionRTT)
        )
      },
      {
        opts: this.opts
      }
    )
  }
}

module.exports = function (pluginConfig) {
  return new Plugin(pluginConfig)
}
