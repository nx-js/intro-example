'use strict'

nx.components.page({
  template: require('./view.html')
}).use(tick).register('clock-comp')

function tick (elem, state) {
  state.date = new Date()
  setInterval(() => state.date = new Date(), 1000)
}
