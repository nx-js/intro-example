'use strict'

nx.component()
  .use(nx.middlewares.render({
    template: require('./view.html')
  }))
  .use(tick)
  .register('clock-comp')

function tick (elem, state) {
  state.date = new Date()
  setInterval(() => state.date = new Date(), 1000)
}
