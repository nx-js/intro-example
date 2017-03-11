'use strict'

nx.components.page({
  template: require('./view.html'),
  params: {
    name: {history: true, url: true, default: 'World'}
  }
}).register('greeting-comp')
