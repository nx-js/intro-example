'use strict'

nx.component()
  .use(nx.middlewares.render({
    template: require('./view.html')
  }))
  .use(nx.middlewares.params({
    title: {history: true, default: 'Star Wars'}
  }))
  .use(plotter)
  .register('movie-plotter')

function plotter (elem, state) {
  elem.$observe(() => {
    fetch('http://www.omdbapi.com/?r=json&t=' + state.title)
      .then(response => response.json())
      .then(data => state.plot = data.Plot || 'No movie plot found.')
  })
}
