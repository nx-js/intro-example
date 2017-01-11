'use strict'

nx.component()
  .use(nx.middlewares.render({
    template: require('./view.html')
  }))
  .use(nx.middlewares.params({
    name: {history: true, default: 'World'}
  }))
  .register('greeting-comp')
