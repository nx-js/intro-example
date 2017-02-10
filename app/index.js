'use strict'

nx.components.app({
  template: require('./view.html'),
  style: require('./style.css')
}).register('intro-app')

nx.components.router()
  .register('router-comp')
