'use strict'

const { describe, it } = require('mocha')
const { expect } = require('chai')
const fastify = require('fastify')

const plugin = require('../')

describe('plugin', () => {
  it('emits metrics for explicit route', async () => {
    const server = fastify()
    server.register(plugin, { app: 'test-app' })

    server.get('/test', (request, reply) => {
      reply.send('hi')
    })

    let received = 0

    const eventsReceived = new Promise((resolve, reject) => {
      const listener = (event) => {
        ++received
        try {
          expect(event.route).to.equal('/test')

          if (event.name === 'latency') {
            expect(event.value).to.be.a('number')
          } else if (event.name === 'response') {
            expect(event.statusCode).to.equal(200)
            expect(event.value).to.equal(1)
          }
        } catch (err) {
          process.removeListener('metric', listener)
          return reject(err)
        }

        if (received === 2) {
          process.removeListener('metric', listener)
          resolve()
        }
      }

      process.on('metric', listener)
    })

    server.inject({ method: 'GET', url: '/test' })
    return eventsReceived
  })

  it('emits metrics for named route', async () => {
    const server = fastify()
    server.register(plugin, { app: 'test-app' })

    server.get('/:value', (request, reply) => {
      reply.send('hi')
    })

    let received = 0

    const eventsReceived = new Promise((resolve, reject) => {
      const listener = (event) => {
        ++received
        try {
          expect(event.route).to.equal('/:value')

          if (event.name === 'latency') {
            expect(event.value).to.be.a('number')
          } else if (event.name === 'response') {
            expect(event.statusCode).to.equal(200)
            expect(event.value).to.equal(1)
          }
        } catch (err) {
          process.removeListener('metric', listener)
          return reject(err)
        }

        if (received === 2) {
          process.removeListener('metric', listener)
          resolve()
        }
      }

      process.on('metric', listener)
    })

    server.inject({ method: 'GET', url: '/test' })
    return eventsReceived
  })

  it('emits metrics for missing routes', async () => {
    const server = fastify()
    server.register(plugin, { app: 'test-app' })
    let received = 0

    const eventsReceived = new Promise((resolve, reject) => {
      const listener = (event) => {
        ++received
        try {
          expect(event.route).to.equal('missing')

          if (event.name === 'latency') {
            expect(event.value).to.be.a('number')
          } else if (event.name === 'response') {
            expect(event.statusCode).to.equal(404)
            expect(event.value).to.equal(1)
          }
        } catch (err) {
          process.removeListener('metric', listener)
          return reject(err)
        }

        if (received === 2) {
          process.removeListener('metric', listener)
          resolve()
        }
      }

      process.on('metric', listener)
    })

    server.inject({ method: 'GET', url: '/test' })
    return eventsReceived
  })
})
