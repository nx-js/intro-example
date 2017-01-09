'use strict'

nx.components.app()
  .use(nx.middlewares.render({
    template: require('./view.html'),
    style: require('./style.css')
  }))
  .register('intro-app')

nx.component()
  .use(nx.middlewares.route)
  .register('router-comp')
