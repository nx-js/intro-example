'use strict'

nx.components.page({
  template: require('./view.html'),
  params: {
    name: {history: true, default: 'World'}
  }
}).register('greeting-comp')
