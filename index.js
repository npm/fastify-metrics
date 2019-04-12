'use strict'

const Emitter = require('numbat-emitter')
const procMetrics = require('numbat-process')
const { kReplyStartTime } = require('fastify/lib/symbols')

const defaultInterval = 1000 * 30 // 30 seconds

const now = () => {
  const ts = process.hrtime()
  return (ts[0] * 1e3) + (ts[1] / 1e6)
}

module.exports = register

async function register (server, options, next) {
  if (!options.metrics) {
    options.metrics = {}
  }

  let emitter
  if (!options.metrics.uri && !options.metrics.path) {
    emitter = { metric () {} }
  } else {
    emitter = new Emitter(options.metrics)
    Emitter.setGlobalEmitter(emitter)
  }

  const stopProcMetrics = procMetrics(emitter, options.metrics.interval || defaultInterval)

  server.addHook('onClose', (instance, next) => {
    Emitter.setGlobalEmitter(false)
    stopProcMetrics()

    return next()
  })

  server.addHook('onResponse', (request, reply, next) => {
    const url = reply.context.config.url || 'missing'
    const elapsed = now() - reply[kReplyStartTime]

    process.emit('metric', {
      name: 'latency',
      value: elapsed,
      route: url
    })

    process.emit('metric', {
      name: 'response',
      statusCode: reply.res.statusCode,
      value: 1,
      route: url
    })

    return next()
  })

  return next()
}

register[Symbol.for('skip-override')] = true
