/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	__webpack_require__(1)

	__webpack_require__(69)
	__webpack_require__(72)
	__webpack_require__(74)


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = __webpack_require__(2)


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	var nx

	if (typeof Proxy === 'undefined') {
	  nx = { supported: false }
	} else {
	  nx = {
	    component: __webpack_require__(3),
	    middlewares: __webpack_require__(14),
	    components: __webpack_require__(44),
	    utils: __webpack_require__(49),
	    supported: true
	  }

	  __webpack_require__(50)
	  __webpack_require__(61)
	}

	if (typeof module !== 'undefined' && module.exports) {
	  module.exports = nx
	}
	if (typeof window !== 'undefined') {
	  window.nx = nx
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	__webpack_require__(4)
	module.exports = __webpack_require__(6)


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	__webpack_require__(5)


/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  registered: Symbol('registered')
	}

	if (!document.registerElement) {
	  const registry = new Map()

	  const observer = new MutationObserver(onMutations)
	  observer.observe(document, {childList: true, subtree: true})

	  function onMutations (mutations) {
	    for (let mutation of mutations) {
	      Array.prototype.forEach.call(mutation.addedNodes, onNodeAdded)
	      Array.prototype.forEach.call(mutation.removedNodes, onNodeRemoved)
	    }
	    mutations = observer.takeRecords()
	    if (mutations.length) {
	      onMutations(mutations)
	    }
	  }

	  function onNodeAdded (node) {
	    if (!(node instanceof Element)) return

	    let config = registry.get(node.getAttribute('is'))
	    if (!config || config.extends !== node.tagName.toLowerCase()) {
	      config = registry.get(node.tagName.toLowerCase())
	    }
	    if (config && !node[secret.registered]) {
	      Object.assign(node, config.prototype)
	      node[secret.registered] = true
	    }
	    if (node[secret.registered] && node.attachedCallback) {
	      node.attachedCallback()
	    }
	    Array.prototype.forEach.call(node.childNodes, onNodeAdded)
	  }

	  function onNodeRemoved (node) {
	    if (node[secret.registered] && node.detachedCallback) {
	      node.detachedCallback()
	    }
	    Array.prototype.forEach.call(node.childNodes, onNodeRemoved)
	  }

	  document.registerElement = function registerElement (name, config) {
	    name = name.toLowerCase()
	    if (config.extends) {
	      config.extends = config.extends.toLowerCase()
	    }
	    registry.set(name, config)

	    if (config.extends) {
	      Array.prototype.forEach.call(document.querySelectorAll(`[is=${name}]`), onNodeAdded)
	    } else {
	      Array.prototype.forEach.call(document.getElementsByTagName(name), onNodeAdded)
	    }
	  }

	  const originalCreateElement = document.createElement
	  document.createElement = function createElement (name, is) {
	    const element = originalCreateElement.call(document, name)
	    if (is) {
	      element.setAttribute('is', is)
	    }
	    return element
	  }
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = __webpack_require__(7)


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const validateConfig = __webpack_require__(8)
	const validateMiddlewares = __webpack_require__(9)
	const getContext = __webpack_require__(10)
	const onNodeAdded = __webpack_require__(11)
	const onNodeRemoved = __webpack_require__(13)

	const secret = {
	  config: Symbol('component config')
	}
	const observerConfig = {
	  childList: true,
	  subtree: true
	}
	let context
	let prevParent
	const addedNodes = new Set()

	module.exports = function component (rawConfig) {
	  return {use, useOnContent, register, [secret.config]: validateConfig(rawConfig)}
	}

	function use (middleware) {
	  if (typeof middleware !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  const config = this[secret.config]
	  config.middlewares = config.middlewares || []
	  config.middlewares.push(middleware)
	  return this
	}

	function useOnContent (contentMiddleware) {
	  if (typeof contentMiddleware !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  const config = this[secret.config]
	  if (config.isolate === true) {
	    console.log('warning: content middlewares have no effect inside isolated components')
	  }
	  config.contentMiddlewares = config.contentMiddlewares || []
	  config.contentMiddlewares.push(contentMiddleware)
	  return this
	}

	function register (name) {
	  if (typeof name !== 'string') {
	    throw new TypeError('first argument must be a string')
	  }
	  const config = this[secret.config]
	  const parentProto = config.element ? config.elementProto : HTMLElement.prototype
	  const proto = Object.create(parentProto)
	  config.shouldValidate = validateMiddlewares(config.contentMiddlewares, config.middlewares)
	  proto[secret.config] = config
	  proto.attachedCallback = attachedCallback
	  if (config.root) {
	    proto.detachedCallback = detachedCallback
	  }
	  return document.registerElement(name, {prototype: proto, extends: config.element})
	}

	function attachedCallback () {
	  const config = this[secret.config]
	  if (!this.$registered) {
	    if (typeof config.state === 'object') {
	      this.$state = config.state
	    } else if (config.state === true) {
	      this.$state = {}
	    } else if (config.state === 'inherit') {
	      this.$state = {}
	      this.$inheritState = true
	    }

	    this.$isolate = config.isolate
	    this.$contentMiddlewares = config.contentMiddlewares
	    this.$middlewares = config.middlewares
	    this.$shouldValidate = config.shouldValidate
	    this.$registered = true

	    if (config.root) {
	      this.$root = this
	      const contentObserver = new MutationObserver(onMutations)
	      contentObserver.observe(this, observerConfig)
	    }

	    if (addedNodes.size === 0) {
	      Promise.resolve().then(processAddedNodes)
	    }
	    addedNodes.add(this)
	  }
	}

	function detachedCallback () {
	  onNodeRemoved(this)
	}

	function onMutations (mutations, contentObserver) {
	  let mutationIndex = mutations.length
	  while (mutationIndex--) {
	    const mutation = mutations[mutationIndex]

	    let nodes = mutation.removedNodes
	    let nodeIndex = nodes.length
	    while (nodeIndex--) {
	      onNodeRemoved(nodes[nodeIndex])
	    }

	    nodes = mutation.addedNodes
	    nodeIndex = nodes.length
	    while (nodeIndex--) {
	      addedNodes.add(nodes[nodeIndex])
	    }
	  }

	  mutations = contentObserver.takeRecords()
	  if (mutations.length) {
	    onMutations(mutations, contentObserver)
	  }

	  processAddedNodes()
	}

	function processAddedNodes () {
	  addedNodes.forEach(processAddedNode)
	  addedNodes.clear()
	  context = prevParent = undefined
	}

	function processAddedNode (node) {
	  const parentNode = node.parentNode || node.host
	  if (prevParent !== parentNode) {
	    prevParent = parentNode
	    context = getContext(parentNode)
	  }
	  onNodeAdded(node, context)
	  if (node.shadowRoot) {
	    const shadowObserver = new MutationObserver(onMutations)
	    shadowObserver.observe(node.shadowRoot, observerConfig)
	  }
	}


/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function validateConfig (rawConfig) {
	  if (rawConfig === undefined) {
	    rawConfig = {}
	  }
	  if (typeof rawConfig !== 'object') {
	    throw new TypeError('invalid component config, must be an object or undefined')
	  }

	  const resultConfig = {}

	  if (typeof rawConfig.state === 'boolean' || rawConfig.state === 'inherit') {
	    resultConfig.state = rawConfig.state
	  } else if (typeof rawConfig.state === 'object') {
	    resultConfig.state = rawConfig.state
	  } else if (rawConfig.state === undefined) {
	    resultConfig.state = true
	  } else {
	    throw new Error('invalid state config: ' + rawConfig.state)
	  }

	  if (typeof rawConfig.isolate === 'boolean' || rawConfig.isolate === 'middlewares') {
	    resultConfig.isolate = rawConfig.isolate
	  } else if (rawConfig.isolate === undefined) {
	    resultConfig.isolate = false
	  } else {
	    throw new Error(`invalid isolate config: ${rawConfig.isolate}, must be a boolean, undefined or 'middlewares'`)
	  }

	  if (typeof rawConfig.root === 'boolean') {
	    resultConfig.root = rawConfig.root
	  } else if (rawConfig.root === undefined) {
	    resultConfig.root = false
	  } else {
	    throw new Error('invalid root config: ' + rawConfig.root)
	  }

	  if (resultConfig.root && (resultConfig.isolate === true || !resultConfig.state)) {
	    throw new Error('root components must have a state and must not be isolated')
	  }

	  if (typeof rawConfig.element === 'string') {
	    try {
	      resultConfig.elementProto = Object.getPrototypeOf(document.createElement(rawConfig.element))
	      resultConfig.element = rawConfig.element
	    } catch (err) {
	      throw new Error(`invalid element config: ${rawConfig.element}, must be the name of a native element`)
	    }
	  } else if (rawConfig.element !== undefined) {
	    throw new Error(`invalid element config: ${rawConfig.element}, must be the name of a native element`)
	  }
	  return resultConfig
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict'

	const names = new Set()
	const missing = new Set()
	const duplicates = new Set()

	module.exports = function validateMiddlewares (contentMiddlewares, middlewares, strict) {
	  names.clear()
	  missing.clear()
	  duplicates.clear()

	  if (contentMiddlewares) {
	    contentMiddlewares.forEach(validateMiddleware)
	  }
	  if (middlewares) {
	    middlewares.forEach(validateMiddleware)
	  }
	  if (missing.size) {
	    if (!strict) return true
	    throw new Error(`missing middlewares: ${Array.from(missing).join()}`)
	  }
	  if (duplicates.size) {
	    if (!strict) return true
	    throw new Error(`duplicate middlewares: ${Array.from(duplicates).join()}`)
	  }
	}

	function validateMiddleware (middleware) {
	  const name = middleware.$name
	  const require = middleware.$require
	  if (name) {
	    if (names.has(name)) {
	      duplicates.add(name)
	    }
	    names.add(name)
	  }
	  if (require) {
	    for (let dependency of require) {
	      if (!names.has(dependency)) {
	        missing.add(dependency)
	      }
	    }
	  }
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function getContext (node) {
	  const context = {contentMiddlewares: []}

	  while (node) {
	    if (!context.state && node.$state) {
	      context.state = node.$state
	    }
	    if (!context.state && node.$contextState) {
	      context.state = node.$contextState
	    }
	    if (!context.isolate) {
	      context.isolate = node.$isolate
	      if (node.$contentMiddlewares) {
	        context.contentMiddlewares = node.$contentMiddlewares.concat(context.contentMiddlewares)
	      }
	    }
	    if (node === node.$root) {
	      context.root = context.root || node
	      return context
	    }
	    if (node.host) {
	      context.root = context.root || node
	      node = node.host
	    } else {
	      node = node.parentNode
	    }
	  }
	  return context
	}


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const validateMiddlewares = __webpack_require__(9)
	const runMiddlewares = __webpack_require__(12)

	module.exports = function onNodeAdded (node, context) {
	  const parent = node.parentNode
	  const validParent = (parent && parent.$lifecycleStage === 'attached')
	  if (validParent && node === node.$root) {
	    throw new Error(`Nested root component: ${node.tagName}`)
	  }
	  if ((validParent || node === node.$root) && context.isolate !== true) {
	    setupNodeAndChildren(node, context.state, context.contentMiddlewares, context.root)
	  }
	}

	function setupNodeAndChildren (node, state, contentMiddlewares, root) {
	  const type = node.nodeType
	  if (!shouldProcess(node, type)) return
	  node.$lifecycleStage = 'attached'

	  node.$contextState = node.$contextState || state || node.$state
	  node.$state = node.$state || node.$contextState
	  if (node.$inheritState) {
	    Object.setPrototypeOf(node.$state, node.$contextState)
	  }

	  node.$root = node.$root || root

	  if (node.$isolate === 'middlewares') {
	    contentMiddlewares = node.$contentMiddlewares || []
	  } else if (node.$contentMiddlewares) {
	    contentMiddlewares = contentMiddlewares.concat(node.$contentMiddlewares)
	  }
	  if (node.$shouldValidate) {
	    validateMiddlewares(contentMiddlewares, node.$middlewares, true)
	  }
	  node.$cleanup = $cleanup

	  runMiddlewares(node, contentMiddlewares, node.$middlewares)

	  if (type === 1 && node.$isolate !== true) {
	    let child = node.firstChild
	    while (child) {
	      setupNodeAndChildren(child, node.$state, contentMiddlewares, node.$root)
	      child = child.nextSibling
	    }

	    child = node.shadowRoot ? node.shadowRoot.firstChild : undefined
	    while (child) {
	      setupNodeAndChildren(child, node.$state, contentMiddlewares, node.shadowRoot)
	      child = child.nextSibling
	    }
	  }
	}

	function shouldProcess (node, type) {
	  if (node.$lifecycleStage) {
	    return false
	  }
	  if (type === 1) {
	    return ((!node.hasAttribute('is') && node.tagName.indexOf('-') === -1) || node.$registered)
	  }
	  if (type === 3) {
	    return node.nodeValue.trim()
	  }
	}

	function $cleanup (fn, ...args) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  this.$cleaners = this.$cleaners || []
	  this.$cleaners.push({fn, args})
	}


/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict'

	let node
	let index, middlewares, middlewaresLength
	let contentIndex, contentMiddlewares, contentMiddlewaresLength

	module.exports = function runMiddlewares (currNode, currContentMiddlewares, currMiddlewares) {
	  node = currNode
	  middlewares = currMiddlewares
	  contentMiddlewares = currContentMiddlewares
	  middlewaresLength = currMiddlewares ? currMiddlewares.length : 0
	  contentMiddlewaresLength = currContentMiddlewares ? currContentMiddlewares.length : 0
	  index = contentIndex = 0
	  next()
	  node = middlewares = contentMiddlewares = undefined
	}

	function next () {
	  if (contentIndex < contentMiddlewaresLength) {
	    contentMiddlewares[contentIndex++].call(node, node, node.$state, next)
	    next()
	  } else if (index < middlewaresLength) {
	    middlewares[index++].call(node, node, node.$state, next)
	    next()
	  }
	}


/***/ },
/* 13 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function onNodeRemoved (node) {
	  const parent = node.parentNode
	  if (!parent || parent.$lifecycleStage === 'detached') {
	    cleanupNodeAndChildren(node)
	  }
	}

	function cleanupNodeAndChildren (node) {
	  if (node.$lifecycleStage !== 'attached') return
	  node.$lifecycleStage = 'detached'

	  if (node.$cleaners) {
	    node.$cleaners.forEach(runCleaner, node)
	    node.$cleaners = undefined
	  }

	  let child = node.firstChild
	  while (child) {
	    cleanupNodeAndChildren(child)
	    child = child.nextSibling
	  }

	  child = node.shadowRoot ? node.shadowRoot.firstChild : undefined
	  while (child) {
	    cleanupNodeAndChildren(child, node.$state, contentMiddlewares)
	    child = child.nextSibling
	  }
	}

	function runCleaner (cleaner) {
	  cleaner.fn.apply(this, cleaner.args)
	}


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  attributes: __webpack_require__(15),
	  events: __webpack_require__(22),
	  interpolate: __webpack_require__(23),
	  render: __webpack_require__(24),
	  flow: __webpack_require__(25),
	  bindable: __webpack_require__(27),
	  bind: __webpack_require__(28),
	  style: __webpack_require__(29),
	  animate: __webpack_require__(30),
	  route: __webpack_require__(31),
	  params: __webpack_require__(32),
	  ref: __webpack_require__(33),
	  observe: __webpack_require__(34)
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)

	let currAttributes
	const handlers = new Map()
	const attributeCache = new Map()

	function attributes (elem, state, next) {
	  if (elem.nodeType !== 1) return

	  currAttributes = getAttributes(elem)
	  elem.$attribute = $attribute
	  elem.$hasAttribute = $hasAttribute
	  next()

	  currAttributes.forEach(processAttributeWithoutHandler, elem)
	  handlers.forEach(processAttributeWithHandler, elem)
	  handlers.clear()
	}
	attributes.$name = 'attributes'
	attributes.$require = ['observe']
	module.exports = attributes

	function $attribute (name, handler) {
	  if (typeof name !== 'string') {
	    throw new TypeError('first argument must be a string')
	  }
	  if (typeof handler !== 'function') {
	    throw new TypeError('second argument must be a function')
	  }
	  if (currAttributes.has(name)) {
	    handlers.set(name, handler)
	  }
	}

	function $hasAttribute (name) {
	  if (typeof name !== 'string') {
	    throw new TypeError('first argument must be a string')
	  }
	  return currAttributes.has(name)
	}

	function getAttributes (elem) {
	  const cloneId = elem.getAttribute('clone-id')
	  let attributes
	  if (cloneId) {
	    attributes = attributeCache.get(cloneId)
	    if (!attributes) {
	      attributes = cacheAttributes(elem.attributes)
	      attributeCache.set(cloneId, attributes)
	    }
	    return attributes
	  }
	  return cacheAttributes(elem.attributes)
	}

	function cacheAttributes (attributes) {
	  let i = attributes.length
	  const cachedAttributes = new Map()
	  while (i--) {
	    const attribute = attributes[i]
	    const type = attribute.name[0]
	    const name = (type === '$' || type === '@') ? attribute.name.slice(1) : attribute.name
	    cachedAttributes.set(name, {value: attribute.value, type})
	  }
	  return cachedAttributes
	}

	function processAttributeWithoutHandler (attr, name) {
	  if (!handlers.has(name)) {
	    if (attr.type === '$') {
	      const expression = compiler.compileExpression(attr.value || name)
	      this.$queue(processExpression, expression, name, defaultHandler)
	    } else if (attr.type === '@') {
	      const expression = compiler.compileExpression(attr.value || name)
	      this.$observe(processExpression, expression, name, defaultHandler)
	    }
	  }
	}

	function processAttributeWithHandler (handler, name) {
	  const attr = currAttributes.get(name)
	  if (attr.type === '@') {
	    const expression = compiler.compileExpression(attr.value || name)
	    this.$observe(processExpression, expression, name, handler)
	  } else if (attr.type === '$') {
	    const expression = compiler.compileExpression(attr.value || name)
	    this.$queue(processExpression, expression, name, handler)
	  } else {
	    handler.call(this, attr.value, name)
	  }
	}

	function processExpression (expression, name, handler) {
	  const value = expression(this.$contextState)
	  handler.call(this, value, name)
	}

	function defaultHandler (value, name) {
	  if (value) {
	    this.setAttribute(name, value)
	  } else {
	    this.removeAttribute(name)
	  }
	}


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const context = __webpack_require__(17)
	const modifiers = __webpack_require__(18)
	const compiler = __webpack_require__(19)

	module.exports = {
	  compileExpression: compiler.compileExpression,
	  compileCode: compiler.compileCode,
	  expose: context.expose,
	  hide: context.hide,
	  hideAll: context.hideAll,
	  filter: modifiers.filter,
	  limiter: modifiers.limiter
	}


/***/ },
/* 17 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict'

	const globals = new Set()
	const proxies = new WeakMap()
	const handlers = {has}

	let globalObj
	if (typeof window !== 'undefined') globalObj = window // eslint-disable-line
	else if (typeof global !== 'undefined') globalObj = global // eslint-disable-line
	else if (typeof self !== 'undefined') globalObj = self // eslint-disable-line
	globalObj.$nxCompileToSandbox = toSandbox
	globalObj.$nxCompileCreateBackup = createBackup

	module.exports = {
	  expose,
	  hide,
	  hideAll
	}

	function expose (...globalNames) {
	  for (let globalName of globalNames) {
	    globals.add(globalName)
	  }
	  return this
	}

	function hide (...globalNames) {
	  for (let globalName of globalNames) {
	    globals.delete(globalName)
	  }
	  return this
	}

	function hideAll () {
	  globals.clear()
	  return this
	}

	function has (target, key) {
	  return globals.has(key) ? Reflect.has(target, key) : true
	}

	function toSandbox (obj) {
	  if (typeof obj !== 'object') {
	    throw new TypeError('first argument must be an object')
	  }
	  let sandbox = proxies.get(obj)
	  if (!sandbox) {
	    sandbox = new Proxy(obj, handlers)
	    proxies.set(obj, sandbox)
	  }
	  return sandbox
	}

	function createBackup (context, tempVars) {
	  if (typeof tempVars === 'object') {
	    const backup = {}
	    for (let key of Object.keys(tempVars)) {
	      backup[key] = context[key]
	    }
	    return backup
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict'

	const filters = new Map()
	const limiters = new Map()

	module.exports = {
	  filters,
	  limiters,
	  filter,
	  limiter
	}

	function filter (name, handler) {
	  if (typeof name !== 'string') {
	    throw new TypeError('First argument must be a string.')
	  }
	  if (typeof handler !== 'function') {
	    throw new TypeError('Second argument must be a function.')
	  }
	  if (filters.has(name)) {
	    throw new Error(`A filter named ${name} is already registered.`)
	  }
	  filters.set(name, handler)
	  return this
	}

	function limiter (name, handler) {
	  if (typeof name !== 'string') {
	    throw new TypeError('First argument must be a string.')
	  }
	  if (typeof handler !== 'function') {
	    throw new TypeError('Second argument must be a function.')
	  }
	  if (limiters.has(name)) {
	    throw new Error(`A limiter named ${name} is already registered.`)
	  }
	  limiters.set(name, handler)
	  return this
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const parser = __webpack_require__(20)

	const expressionCache = new Map()
	const codeCache = new Map()

	module.exports = {
	  compileExpression,
	  compileCode
	}

	function compileExpression (src) {
	  if (typeof src !== 'string') {
	    throw new TypeError('First argument must be a string.')
	  }
	  let expression = expressionCache.get(src)
	  if (!expression) {
	    expression = parser.parseExpression(src)
	    expressionCache.set(src, expression)
	  }

	  if (typeof expression === 'function') {
	    return expression
	  }

	  return function evaluateExpression (context) {
	    let value = expression.exec(context)
	    for (let filter of expression.filters) {
	      const args = filter.argExpressions.map(evaluateArgExpression, context)
	      value = filter.effect(value, ...args)
	    }
	    return value
	  }
	}

	function compileCode (src) {
	  if (typeof src !== 'string') {
	    throw new TypeError('First argument must be a string.')
	  }
	  let code = codeCache.get(src)
	  if (!code) {
	    code = parser.parseCode(src)
	    codeCache.set(src, code)
	  }

	  if (typeof code === 'function') {
	    return code
	  }

	  const context = {}
	  return function evaluateCode (state, tempVars) {
	    let i = 0
	    function next () {
	      Object.assign(context, tempVars)
	      if (i < code.limiters.length) {
	        const limiter = code.limiters[i++]
	        const args = limiter.argExpressions.map(evaluateArgExpression, state)
	        limiter.effect(next, context, ...args)
	      } else {
	        code.exec(state, tempVars)
	      }
	    }
	    next()
	  }
	}

	function evaluateArgExpression (argExpression) {
	  return argExpression(this)
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const modifiers = __webpack_require__(18)
	const rawCompiler = __webpack_require__(21)

	const filterRegex = /(?:[^\|]|\|\|)+/g
	const limiterRegex = /(?:[^&]|&&)+/g
	const argsRegex = /\S+/g

	module.exports = {
	  parseExpression,
	  parseCode
	}

	function parseExpression (src) {
	  const tokens = src.match(filterRegex)
	  if (tokens.length === 1) {
	    return rawCompiler.compileExpression(tokens[0])
	  }

	  const expression = {
	    exec: rawCompiler.compileExpression(tokens[0]),
	    filters: []
	  }
	  for (let i = 1; i < tokens.length; i++) {
	    let filterTokens = tokens[i].match(argsRegex) || []
	    const filterName = filterTokens.shift()
	    const effect = modifiers.filters.get(filterName)
	    if (!effect) {
	      throw new Error(`There is no filter named: ${filterName}.`)
	    }
	    expression.filters.push({effect, argExpressions: filterTokens.map(compileArgExpression)})
	  }
	  return expression
	}

	function parseCode (src) {
	  const tokens = src.match(limiterRegex)
	  if (tokens.length === 1) {
	    return rawCompiler.compileCode(tokens[0])
	  }

	  const code = {
	    exec: rawCompiler.compileCode(tokens[0]),
	    limiters: []
	  }
	  for (let i = 1; i < tokens.length; i++) {
	    const limiterTokens = tokens[i].match(argsRegex) || []
	    const limiterName = limiterTokens.shift()
	    const effect = modifiers.limiters.get(limiterName)
	    if (!effect) {
	      throw new Error(`There is no limiter named: ${limiterName}.`)
	    }
	    code.limiters.push({effect, argExpressions: limiterTokens.map(compileArgExpression)})
	  }
	  return code
	}

	function compileArgExpression (argExpression) {
	  return rawCompiler.compileExpression(argExpression)
	}


/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict'

	module.exports = {
	  compileCode,
	  compileExpression
	}

	function compileExpression (src) {
	  return new Function('context', // eslint-disable-line
	    `const sandbox = $nxCompileToSandbox(context)
	    try { with (sandbox) { return ${src} } } catch (err) {
	      if (!(err instanceof TypeError)) throw err
	    }`)
	}

	function compileCode (src) {
	  return new Function('context', 'tempVars', // eslint-disable-line
	    `const backup = $nxCompileCreateBackup(context, tempVars)
	    Object.assign(context, tempVars)
	    const sandbox = $nxCompileToSandbox(context)
	    try {
	      with (sandbox) { ${src} }
	    } finally {
	      Object.assign(context, backup)
	    }`)
	}


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)

	const secret = {
	  handlers: Symbol('event handlers')
	}
	const handlerCache = new Map()

	function events (elem) {
	  if (elem.nodeType !== 1) return

	  const handlers = getEventHandlers(elem)
	  if (handlers) {
	    handlers.forEach(addEventHandlers, elem)
	    elem[secret.handlers] = handlers
	  }
	}
	events.$name = 'events'
	module.exports = events

	function getEventHandlers (elem) {
	  const cloneId = elem.getAttribute('clone-id')
	  if (cloneId) {
	    let handlers = handlerCache.get(cloneId)
	    if (handlers === undefined) {
	      handlers = createEventHandlers(elem)
	      handlerCache.set(cloneId, handlers)
	    }
	    return handlers
	  }
	  return createEventHandlers(elem)
	}

	function createEventHandlers (elem) {
	  let handlers = false
	  const attributes = elem.attributes
	  let i = attributes.length
	  while (i--) {
	    const attribute = attributes[i]
	    if (attribute.name[0] === '#') {
	      handlers = handlers || new Map()
	      const handler = compiler.compileCode(attribute.value)
	      const names = attribute.name.slice(1).split(',')
	      for (let name of names) {
	        let typeHandlers = handlers.get(name)
	        if (!typeHandlers) {
	          typeHandlers = new Set()
	          handlers.set(name, typeHandlers)
	        }
	        typeHandlers.add(handler)
	      }
	    }
	  }
	  return handlers
	}

	function addEventHandlers (handlers, type) {
	  this.addEventListener(type, listener, true)
	}

	function listener (ev) {
	  const handlers = this[secret.handlers].get(ev.type)
	  for (let handler of handlers) {
	    handler(this.$contextState, { $event: ev })
	  }
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)

	const tokenCache = new Map()

	function interpolate (node) {
	  if (node.nodeType !== 3) return
	  createTokens(node).forEach(processToken, node)
	}
	interpolate.$name = 'interpolate'
	interpolate.$require = ['observe']
	module.exports = interpolate

	function createTokens (node) {
	  const nodeValue = node.nodeValue
	  let tokens = tokenCache.get(nodeValue)
	  if (!tokens) {
	    tokens = parseValue(node.nodeValue)
	    tokenCache.set(nodeValue, tokens)
	    return tokens
	  }
	  return tokens.map(cloneToken)
	}

	function cloneToken (token) {
	  if (typeof token === 'object') {
	    return {
	      observed: token.observed,
	      expression: token.expression,
	      toString: token.toString
	    }
	  }
	  return token
	}

	function processToken (token, index, tokens) {
	  if (typeof token === 'object') {
	    const expression = compiler.compileExpression(token.expression)
	    if (token.observed) {
	      this.$observe(interpolateToken, expression, token, tokens)
	    } else {
	      this.$queue(interpolateToken, expression, token, tokens)
	    }
	  }
	}

	function interpolateToken (expression, token, tokens) {
	  let value = expression(this.$state)
	  value = (value !== undefined) ? value : ''
	  if (token.value !== value) {
	    token.value = value
	    this.nodeValue = (1 < tokens.length) ? tokens.join('') : value
	  }
	}

	function parseValue (string) {
	  const tokens = []
	  const length = string.length
	  let expression = false
	  let anchor = 0
	  let depth = 0
	  let token

	  for (let i = 0; i < length; i++) {
	    const char = string[i]

	    if (expression) {
	      if (char === '{') {
	        depth++
	      } else if (char === '}') {
	        depth--
	      }

	      if (depth === 0) {
	        token.expression = string.slice(anchor, i)
	        token.toString = tokenToString
	        tokens.push(token)
	        anchor = i + 1
	        expression = false
	      }
	    } else {
	      if (i === length - 1) {
	        tokens.push(string.slice(anchor, i + 1))
	      } else if ((char === '$' || char === '@') && string.charAt(i + 1) === '{') {
	        if (i !== anchor) {
	          tokens.push(string.slice(anchor, i))
	        }
	        token = {observed: (char === '@')}
	        anchor = i + 2
	        depth = 0
	        expression = true
	      }
	    }
	  }
	  return tokens
	}

	function tokenToString () {
	  return String(this.value)
	}


/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict'

	let cloneId = 0
	let selectorScope
	const hostRegex = /:host/g
	const functionalHostRegex = /:host\((.*?)\)/g

	module.exports = function renderFactory (config) {
	  config = validateAndCloneConfig(config)
	  config.template = cacheTemplate(config.template)

	  function render (elem) {
	    if (elem.nodeType !== 1) {
	      throw new Error('render only works with element nodes')
	    }
	    addContext(elem)

	    const template = document.importNode(config.template, true)

	    // fall back to non shadow mode (scoped style) for now, add polyfill later
	    if (config.shadow && elem.attachShadow) {
	      const shadowRoot = elem.attachShadow({mode: 'open'})
	      shadowRoot.appendChild(template)
	      const style = document.createElement('style')
	      style.appendChild(document.createTextNode(config.style))
	      shadowRoot.appendChild(style)
	    } else {
	      composeContentWithTemplate(elem, template)
	      if (config.style) {
	        addScopedStyle(elem, config.style)
	        config.style = undefined
	      }
	    }
	  }
	  render.$name = 'render'
	  return render
	}

	function addContext (elem) {
	  let child = elem.firstChild
	  while (child) {
	    child.$contextState = elem.$contextState
	    child = child.nextSibling
	  }
	}

	function composeContentWithTemplate (elem, template) {
	  let defaultSlot
	  const slots = template.querySelectorAll('slot')

	  for (let i = slots.length; i--;) {
	    const slot = slots[i]
	    if (slot.getAttribute('name')) {
	      const slotFillers = elem.querySelectorAll(`[slot=${slot.getAttribute('name')}]`)
	      if (slotFillers.length) {
	        slot.innerHTML = ''
	        for (let i = slotFillers.length; i--;) {
	          slot.appendChild(slotFillers[i])
	        }
	      }
	    } else {
	      defaultSlot = slot
	    }
	  }

	  if (defaultSlot && elem.firstChild) {
	    defaultSlot.innerHTML = ''
	    while (elem.firstChild) {
	      defaultSlot.appendChild(elem.firstChild)
	    }
	  }
	  elem.innerHTML = ''
	  elem.appendChild(template)
	}

	function addScopedStyle (elem, styleString) {
	  setSelectorScope(elem)
	  styleString = styleString
	    .replace(functionalHostRegex, `${selectorScope}$1`)
	    .replace(hostRegex, selectorScope)

	  const style = document.createElement('style')
	  style.appendChild(document.createTextNode(styleString))
	  document.head.insertBefore(style, document.head.firstChild)

	  scopeSheet(style.sheet)
	}

	function setSelectorScope (elem) {
	  const is = elem.getAttribute('is')
	  selectorScope = (is ? `${elem.tagName}[is="${is}"]` : elem.tagName).toLowerCase()
	}

	function scopeSheet (sheet) {
	  const rules = sheet.cssRules
	  for (let i = rules.length; i--;) {
	    const rule = rules[i]
	    if (rule.type === 1) {
	      const selectorText = rule.selectorText.split(',').map(scopeSelector).join(', ')
	      const styleText = rule.style.cssText
	      sheet.deleteRule(i)
	      sheet.insertRule(`${selectorText} { ${styleText} }`, i)
	    } else if (rule.type === 4) { // media rules
	      scopeSheet(rule)
	    }
	  }
	}

	function scopeSelector (selector) {
	  if (selector.indexOf(selectorScope) !== -1) {
	    return selector
	  }
	  return `${selectorScope} ${selector}`
	}

	function cacheTemplate (templateHTML) {
	  let template = document.createElement('template')
	  template.innerHTML = templateHTML
	  return template.content
	}

	function validateAndCloneConfig (rawConfig) {
	  const resultConfig = {}

	  if (typeof rawConfig !== 'object') {
	    throw new TypeError('config must be an object')
	  }

	  if (typeof rawConfig.template === 'string') {
	    resultConfig.template = rawConfig.template
	  } else {
	    throw new TypeError('template config must be a string')
	  }

	  if (typeof rawConfig.style === 'string') {
	    resultConfig.style = rawConfig.style
	  } else if (rawConfig.style !== undefined) {
	    throw new TypeError('style config must be a string or undefined')
	  }

	  if (typeof rawConfig.shadow === 'boolean') {
	    resultConfig.shadow = rawConfig.shadow
	  } else if (rawConfig.shadow !== undefined) {
	    throw new TypeError('shadow config must be a boolean or undefined')
	  }

	  return resultConfig
	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const dom = __webpack_require__(26)

	const secret = {
	  showing: Symbol('flow showing'),
	  prevArray: Symbol('flow prevArray'),
	  trackBy: Symbol('track by')
	}

	function flow (elem) {
	  if (elem.nodeType !== 1) return

	  const hasIf = elem.$hasAttribute('if')
	  const hasRepeat = elem.$hasAttribute('repeat')

	  if (hasIf && hasRepeat) {
	    throw new Error('if and repeat attributes can not be used on the same element')
	  }
	  if (hasIf || hasRepeat) {
	    dom.normalizeContent(elem)
	    dom.extractContent(elem)
	  }

	  elem.$attribute('if', ifAttribute)
	  elem.$attribute('track-by', trackByAttribute)
	  elem.$attribute('repeat', repeatAttribute)
	}
	flow.$name = 'flow'
	flow.$require = ['attributes']
	module.exports = flow

	function ifAttribute (show) {
	  if (show && !this[secret.showing]) {
	    dom.insertContent(this)
	    this[secret.showing] = true
	  } else if (!show && this[secret.showing]) {
	    dom.clearContent(this)
	    this[secret.showing] = false
	  }
	}

	function trackByAttribute (trackBy) {
	  this[secret.trackBy] = trackBy
	}

	function repeatAttribute (array) {
	  const repeatValue = this.getAttribute('repeat-value') || '$value'
	  const repeatIndex = this.getAttribute('repeat-index') || '$index'

	  let trackBy = this[secret.trackBy] || isSame
	  let trackByProp
	  if (typeof trackBy === 'string') {
	    trackByProp = trackBy
	    trackBy = isSame
	  }

	  array = array || []
	  const prevArray = this[secret.prevArray] = this[secret.prevArray] || []

	  let i = -1
	  iteration: for (let item of array) {
	    let prevItem = prevArray[++i]

	    if (prevItem === item) {
	      continue
	    }
	    if (trackBy(item, prevItem, trackByProp)) {
	      dom.mutateContext(this, i, {[repeatValue]: item})
	      prevArray[i] = item
	      continue
	    }
	    for (let j = i + 1; j < prevArray.length; j++) {
	      prevItem = prevArray[j]
	      if (trackBy(item, prevItem, trackByProp)) {
	        dom.moveContent(this, j, i, {[repeatIndex]: i})
	        prevArray.splice(i, 0, prevItem)
	        prevArray.splice(j, 1)
	        continue iteration
	      }
	    }
	    dom.insertContent(this, i, {[repeatIndex]: i, [repeatValue]: item})
	    prevArray.splice(i, 0, item)
	  }

	  if ((++i) === 0) {
	    prevArray.length = 0
	    dom.clearContent(this)
	  } else {
	    while (i < prevArray.length) {
	      dom.removeContent(this)
	      prevArray.pop()
	    }
	  }
	}

	function isSame (item1, item2, prop) {
	  return (item1 === item2 ||
	    (prop && typeof item1 === 'object' && typeof item2 === 'object' &&
	    item1 && item2 && item1[prop] === item2[prop]))
	}


/***/ },
/* 26 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  template: Symbol('content template'),
	  firstNodes: Symbol('first nodes')
	}
	let cloneId = 0

	module.exports = {
	  extractContent,
	  normalizeContent,
	  insertContent,
	  moveContent,
	  removeContent,
	  clearContent,
	  mutateContext
	}

	function extractContent (elem) {
	  const template = document.createDocumentFragment()
	  let node = elem.firstChild
	  while (node) {
	    template.appendChild(node)
	    node = elem.firstChild
	  }
	  elem[secret.template] = template
	  elem[secret.firstNodes] = []
	  return template
	}

	function normalizeContent (node) {
	  if (node.nodeType === 1) {
	    node.setAttribute('clone-id', `content-${cloneId++}`)
	    const childNodes = node.childNodes
	    let i = childNodes.length
	    while (i--) {
	      normalizeContent(childNodes[i])
	    }
	  } else if (node.nodeType === 3) {
	    if (!node.nodeValue.trim()) node.remove()
	  } else {
	    node.remove()
	  }
	}

	function insertContent (elem, index, contextState) {
	  if (index !== undefined && typeof index !== 'number') {
	    throw new TypeError('Second argument must be a number or undefined.')
	  }
	  if (contextState !== undefined && typeof contextState !== 'object') {
	    throw new TypeError('Third argument must be an object or undefined.')
	  }
	  if (!elem[secret.template]) {
	    throw new Error('you must extract a template with $extractContent before inserting')
	  }
	  const content = elem[secret.template].cloneNode(true)
	  const firstNodes = elem[secret.firstNodes]
	  const firstNode = content.firstChild
	  const beforeNode = firstNodes[index]

	  if (contextState) {
	    contextState = Object.assign(Object.create(elem.$state), contextState)
	    let node = firstNode
	    while (node) {
	      node.$contextState = contextState
	      node = node.nextSibling
	    }
	  }

	  elem.insertBefore(content, beforeNode)
	  if (beforeNode) firstNodes.splice(index, 0, firstNode)
	  else firstNodes.push(firstNode)
	}

	function removeContent (elem, index) {
	  if (index !== undefined && typeof index !== 'number') {
	    throw new TypeError('Second argument must be a number or undefined.')
	  }
	  const firstNodes = elem[secret.firstNodes]
	  index = firstNodes[index] ? index : (firstNodes.length - 1)
	  const firstNode = firstNodes[index]
	  const nextNode = firstNodes[index + 1]


	  let node = firstNode
	  let next
	  while (node && node !== nextNode) {
	    next = node.nextSibling
	    node.remove()
	    node = next
	  }

	  if (nextNode) firstNodes.splice(index, 1)
	  else firstNodes.pop()
	}

	function clearContent (elem) {
	  elem.innerHTML = ''
	  elem[secret.firstNodes] = []
	}

	function moveContent (elem, fromIndex, toIndex, extraContext) {
	  if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
	    throw new Error('first and second argument must be numbers')
	  }
	  if (extraContext !== undefined && typeof extraContext !== 'object') {
	    throw new Error('third argument must be an object or undefined')
	  }
	  const firstNodes = elem[secret.firstNodes]
	  const fromNode = firstNodes[fromIndex]
	  const untilNode = firstNodes[fromIndex + 1]
	  const toNode = firstNodes[toIndex]

	  let node = fromNode
	  let next
	  while (node && node !== untilNode) {
	    next = node.nextSibling
	    elem.insertBefore(node, toNode)
	    node = next
	  }
	  firstNodes.splice(fromIndex, 1)
	  firstNodes.splice(toIndex, 0, fromNode)

	  if (extraContext && fromNode && fromNode.$contextState) {
	    Object.assign(fromNode.$contextState, extraContext)
	  }
	}

	function mutateContext (elem, index, extraContext) {
	  if (index !== undefined && typeof index !== 'number') {
	    throw new TypeError('first argument must be a number or undefined')
	  }
	  if (typeof extraContext !== 'object') {
	    throw new TypeError('second argument must be an object')
	  }
	  const startNode = elem[secret.firstNodes][index]
	  if (startNode && startNode.$contextState) {
	    Object.assign(startNode.$contextState, extraContext)
	  }
	}


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  bound: Symbol('bound element'),
	  params: Symbol('bind params'),
	  bindEvents: Symbol('bind events'),
	  signal: Symbol('observing signal'),
	  preventSubmit: Symbol('prevent submit')
	}
	const paramsRegex = /\S+/g
	const defaultParams = {mode: 'two-way', on: 'change', type: 'string'}

	function onInput (ev) {
	  const elem = ev.target
	  const params = elem[secret.params]
	  if (ev.type === 'submit') {
	    syncStateWithForm(elem)
	  } else if (elem[secret.bound] && params.on.indexOf(ev.type) !== -1) {
	    syncStateWithElement(elem)
	  }
	}

	function bindable (elem, state, next) {
	  if (elem.nodeType !== 1) return

	  elem.$bindable = $bindable
	  next()
	  elem.$attribute('bind', bindAttribute)
	}
	bindable.$name = 'bindable'
	bindable.$require = ['observe', 'attributes']
	module.exports = bindable

	function $bindable (params) {
	  this[secret.params] = Object.assign({}, defaultParams, params)
	}

	function bindAttribute (newParams) {
	  const params = this[secret.params]

	  if (params) {
	    if (newParams && typeof newParams === 'string') {
	      const tokens = newParams.match(paramsRegex)
	      params.mode = tokens[0] || params.mode,
	      params.on = tokens[1] ? tokens[1].split(',') : params.on,
	      params.type = tokens[2] || params.type
	    } else if (newParams && typeof newParams === 'object') {
	      Object.assign(params, newParams)
	    }
	    if (!Array.isArray(params.on)) {
	      params.on = [params.on]
	    }
	    bindElement(this)
	    this[secret.bound] = true
	  }
	}

	function bindElement (elem) {
	  const params = elem[secret.params]
	  if (params.mode === 'two-way' && !elem[secret.signal]) {
	    Promise.resolve().then(() => elem[secret.signal] = elem.$observe(syncElementWithState, elem))
	  } else if (params.mode === 'one-time') {
	    elem.$unobserve(elem[secret.signal])
	    Promise.resolve().then(() => elem.$queue(syncElementWithState, elem))
	    elem[secret.signal] = undefined
	  } else if (params.mode === 'one-way') {
	    elem.$unobserve(elem[secret.signal])
	    elem[secret.signal] = undefined
	  }
	  registerListeners(elem, params)
	}

	function registerListeners (elem, params) {
	  const root = elem.$root
	  let bindEvents = root[secret.bindEvents]
	  if (!bindEvents) {
	    bindEvents = root[secret.bindEvents] = new Set()
	  }
	  if (!root[secret.preventSubmit]) {
	    root.addEventListener('submit', preventDefault, true)
	    root[secret.preventSubmit] = true
	  }
	  for (let eventName of params.on) {
	    if (!bindEvents.has(eventName)) {
	      root.addEventListener(eventName, onInput, true)
	      bindEvents.add(eventName)
	    }
	  }
	}

	function preventDefault (ev) {
	  ev.preventDefault()
	}

	function syncElementWithState (elem) {
	  const params = elem[secret.params]
	  const value = getValue(elem.$state, elem.name)
	  if (elem.type === 'radio' || elem.type === 'checkbox') {
	    elem.checked = (value === toType(elem.value, params.type))
	  } else if (elem.value !== toType(value)) {
	    elem.value = toType(value)
	  }
	}

	function syncStateWithElement (elem) {
	  const params = elem[secret.params]
	  if (elem.type === 'radio' || elem.type === 'checkbox') {
	    const value = elem.checked ? toType(elem.value, params.type) : undefined
	    setValue(elem.$state, elem.name, value)
	  } else {
	    setValue(elem.$state, elem.name, toType(elem.value, params.type))
	  }
	}

	function syncStateWithForm (form) {
	  Array.prototype.forEach.call(form.elements, syncStateWithFormControl)
	}

	function syncStateWithFormControl (elem) {
	  if (elem[secret.bound]) {
	    const params = elem[secret.params]
	    if (params.on.indexOf('submit') !== -1) {
	      syncStateWithElement(elem)
	    }
	  }
	}

	function toType (value, type) {
	  if (value === '') return undefined
	  if (value === undefined) return ''
	  if (type === 'string') return String(value)
	  else if (type === 'number') return Number(value)
	  else if (type === 'boolean') return Boolean(value)
	  else if (type === 'date') return new Date(value)
	  return value
	}

	function getValue (state, name) {
	  const tokens = name.split('.')
	  let value = state
	  for (let token of tokens) {
	    value = value[token]
	  }
	  return value
	}

	function setValue (state, name, value) {
	  const tokens = name.split('.')
	  const propName = tokens.pop()
	  let parent = state
	  for (let token of tokens) {
	    parent = parent[token]
	  }
	  parent[propName] = value
	}


/***/ },
/* 28 */
/***/ function(module, exports) {

	'use strict'

	function bind (elem) {
	  if (!elem.nodeType === 1) return

	  if (isInput(elem)) {
	    elem.$bindable({
	      mode: 'two-way',
	      on: elem.form ? 'submit' : 'change',
	      type: getType(elem)
	    })
	  }
	}
	bind.$name = 'bind'
	bind.$require = ['bindable']
	module.exports = bind

	function isInput (elem) {
	  const tagName = elem.tagName
	  return (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA')
	}

	function getType (elem) {
	  if (elem.tagName === 'INPUT') {
	    if (elem.type === 'checkbox') {
	      return 'boolean'
	    }
	    if (elem.type === 'number' || elem.type === 'range' || elem.type === 'week') {
	      return 'number'
	    }
	    if (elem.type === 'date' || elem.type === 'datetime') {
	      return 'date'
	    }
	    if (elem.type === 'datetime-local' || elem.type === 'month') {
	      return 'date'
	    }
	  }
	  return 'string'
	}


/***/ },
/* 29 */
/***/ function(module, exports) {

	'use strict'

	function style (elem) {
	  if (elem.nodeType !== 1) return

	  elem.$attribute('class', classAttribute)
	  elem.$attribute('style', styleAttribute)
	}
	style.$name = 'style'
	style.$require = ['attributes']
	module.exports = style

	function classAttribute (classes) {
	  if (typeof classes === 'object') {
	    for (var item in classes) {
	      if (classes[item]) {
	        this.classList.add(item)
	      } else if (this.className) {
	        this.classList.remove(item)
	      }
	    }
	  } else if (this.className !== classes) {
	    this.className = classes
	  }
	}

	function styleAttribute (styles) {
	  if (typeof styles === 'object') {
	    Object.assign(this.style, styles)
	  } else if (this.style.cssText !== styles) {
	    this.style.cssText = styles
	  }
	}


/***/ },
/* 30 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  entering: Symbol('during entering animation'),
	  leaving: Symbol('during leaving animation'),
	  moveTransition: Symbol('watch move transition'),
	  position: Symbol('animated element position'),
	  parent: Symbol('parent node of leaving node'),
	  listening: Symbol('listening for animationend')
	}
	const watchedNodes = new Set()
	let checkQueued = false

	function onAnimationEnd (ev) {
	  const elem = ev.target
	  if (elem[secret.leaving]) {
	    elem.remove()
	  }
	  if (elem[secret.entering]) {
	    elem.style.animation = ''
	    elem[secret.entering] = false
	  }
	}

	function animate (elem) {
	  if (elem.nodeType !== 1) return

	  elem.$attribute('enter-animation', enterAttribute)
	  elem.$attribute('leave-animation', leaveAttribute)
	  elem.$attribute('move-animation', moveAttribute)

	  queueCheck()
	  elem.$cleanup(queueCheck)
	}
	animate.$name = 'animate'
	animate.$require = ['attributes']
	module.exports = animate

	function enterAttribute (animation) {
	  if (this[secret.entering] !== false) {
	    this[secret.entering] = true
	    if (typeof animation === 'object' && animation) {
	      animation = animationObjectToString(animation)
	    } else if (typeof animation === 'string') {
	      animation = animation
	    }
	    this.style.animation = animation
	    setAnimationDefaults(this)
	    registerListener(this)
	  }
	}

	function leaveAttribute (animation) {
	  if (!this[secret.parent]) {
	    watchedNodes.add(this)
	    this.$cleanup(unwatch)
	    this.$cleanup(onLeave, animation)
	    this[secret.parent] = this.parentNode
	    registerListener(this)
	  }
	}

	function registerListener (elem) {
	  const root = elem.$root
	  if (!root[secret.listening]) {
	    root.addEventListener('animationend', onAnimationEnd, true)
	    root[secret.listening] = true
	  }
	}

	function onLeave (animation) {
	  this[secret.leaving] = true
	  if (typeof animation === 'object' && animation) {
	    animation = animationObjectToString(animation)
	  } else if (typeof animation === 'string') {
	    animation = animation
	  }
	  this.style.animation = animation
	  setAnimationDefaults(this)

	  this[secret.parent].appendChild(this)
	  if (shouldAbsolutePosition(this)) {
	    toAbsolutePosition(this)
	  }
	}

	function moveAttribute (transition) {
	  if (!this[secret.moveTransition]) {
	    watchedNodes.add(this)
	    this.$cleanup(unwatch)
	    this[secret.moveTransition] = true
	  }
	  if (typeof transition === 'object' && transition) {
	    transition = 'transform ' + transitionObjectToString(transition)
	  } else if (typeof transition === 'string') {
	    transition = 'transform ' + transition
	  } else {
	    transition = 'transform'
	  }
	  this.style.transition = transition
	  setTransitionDefaults(this)
	}

	function unwatch () {
	  watchedNodes.delete(this)
	}

	function queueCheck () {
	  if (!checkQueued) {
	    checkQueued = true
	    requestAnimationFrame(checkWatchedNodes)
	  }
	}

	function checkWatchedNodes () {
	  for (let elem of watchedNodes) {
	    const position = {
	      left: elem.offsetLeft,
	      top: elem.offsetTop
	    }
	    const prevPosition = elem[secret.position] || {}
	    elem[secret.position] = position

	    const xDiff = (prevPosition.left - position.left) || 0
	    const yDiff = (prevPosition.top - position.top) || 0
	    if (elem[secret.moveTransition] && (xDiff || yDiff)) {
	      onMove(elem, xDiff, yDiff)
	    }
	  }
	  checkQueued = false
	}

	function onMove (elem, xDiff, yDiff) {
	  const style = elem.style
	  const transition = style.transition
	  style.transition = ''
	  style.transform = `translate3d(${xDiff}px, ${yDiff}px, 0)`
	  requestAnimationFrame(() => {
	    style.transition = transition
	    style.transform = ''
	  })
	}

	function animationObjectToString (animation) {
	  return [
	    animation.name,
	    timeToString(animation.duration),
	    animation.timingFunction,
	    timeToString(animation.delay),
	    animation.iterationCount,
	    animation.direction,
	    animation.fillMode,
	    boolToPlayState(animation.playState)
	  ].join(' ')
	}

	function transitionObjectToString (transition) {
	  return [
	    timeToString(transition.duration),
	    timeToString(transition.delay),
	    transition.timingFunction
	  ].join(' ')
	}

	function setAnimationDefaults (elem) {
	  const style = elem.style
	  const duration = style.animationDuration
	  const fillMode = style.animationFillMode
	  if (duration === 'initial' || duration === '' || duration === '0s') {
	    style.animationDuration = '1s'
	  }
	  if (fillMode === 'initial' || fillMode === '' || fillMode === 'none') {
	    style.animationFillMode = 'both'
	  }
	}

	function setTransitionDefaults (elem) {
	  const style = elem.style
	  const duration = style.transitionDuration
	  if (duration === 'initial' || duration === '' || duration === '0s') {
	    style.transitionDuration = '1s'
	  }
	}

	function shouldAbsolutePosition (elem) {
	  elem = elem.parentNode
	  while (elem && elem !== elem.$root) {
	    if (elem[secret.leaving]) return false
	    elem = elem.parentNode
	  }
	  return true
	}

	function toAbsolutePosition (elem) {
	  const style = elem.style
	  const position = elem[secret.position]
	  style.left = `${position.left}px`
	  style.top = `${position.top}px`
	  style.margin = '0'
	  style.width = '-moz-max-content'
	  style.width = '-webkit-max-content'
	  style.width = 'max-content'
	  style.position = 'absolute'
	}

	function timeToString (time) {
	  return (typeof time === 'number') ? time + 'ms' : time
	}

	function boolToPlayState (bool) {
	  return (bool === false || bool === 'paused') ? 'paused' : 'running'
	}


/***/ },
/* 31 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  config: Symbol('router config')
	}
	const rootRouters = new Set()
	let cloneId = 0

	window.addEventListener('popstate', onPopState, true)

	function onPopState (ev) {
	  for (let router of rootRouters) {
	    routeRouterAndChildren(router, history.state.route)
	  }
	}

	function router (router) {
	  if (router.nodeType !== 1) {
	    throw new Error('router only works with element nodes')
	  }
	  setupRouter(router)
	  extractViews(router)
	  routeRouterAndChildren(router, absoluteToRelativeRoute(router, history.state.route))
	}
	router.$name = 'router'
	module.exports = router

	function setupRouter (router) {
	  router[secret.config] = {
	    children: new Set(),
	    templates: new Map()
	  }
	  const parentRouter = findParentRouter(router)
	  if (parentRouter) {
	    router.$routerLevel = parentRouter.$routerLevel + 1
	    const siblingRouters = parentRouter[secret.config].children
	    siblingRouters.add(router)
	    router.$cleanup(cleanupRouter, siblingRouters)
	  } else {
	    router.$routerLevel = 1
	    rootRouters.add(router)
	    router.$cleanup(cleanupRouter, rootRouters)
	  }
	}

	function cleanupRouter (siblingRouters) {
	  siblingRouters.delete(this)
	}

	function absoluteToRelativeRoute (router, route) {
	  return route.slice(router.$routerLevel - 1)
	}

	function extractViews (router) {
	  let child = router.firstChild
	  while (child) {
	    if (child.nodeType === 1 && child.hasAttribute('route')) {
	      const route = child.getAttribute('route')
	      router[secret.config].templates.set(route, child)
	      if (child.hasAttribute('default-route')) {
	        router[secret.config].defaultView = route
	      }
	    }
	    child.remove()
	    child = router.firstChild
	  }
	}

	function findParentRouter (node) {
	  node = node.parentNode
	  while (node && node.$routerLevel === undefined) {
	    node = node.parentNode
	  }
	  return node
	}

	function routeRouterAndChildren (router, route) {
	  route = route.slice()
	  const config = router[secret.config]
	  const templates = config.templates
	  const defaultView = config.defaultView
	  const prevView = router.$currentView
	  let nextView = route.shift()

	  if (!templates.has(nextView) && templates.has(defaultView)) {
	    nextView = defaultView
	  }
	  if (prevView !== nextView) {
	    const eventConfig = {
	      bubbles: true,
	      cancelable: true,
	      detail: {
	        from: prevView,
	        to: nextView
	      }
	    }
	    const routeEvent = new CustomEvent('route', eventConfig)
	    router.dispatchEvent(routeEvent)

	    if (!routeEvent.defaultPrevented) {
	      routeRouter(router, nextView)
	      router.$currentView = nextView
	    }
	  } else {
	    routeChildren(router, route)
	  }
	}

	function routeRouter (router, nextView) {
	  router.innerHTML = ''
	  const template = router[secret.config].templates.get(nextView)
	  if (template) {
	    router.appendChild(document.importNode(template, true))
	  }
	}

	function routeChildren (router, route) {
	  for (let childRouter of router[secret.config].children) {
	    routeRouterAndChildren(childRouter, route)
	  }
	}


/***/ },
/* 32 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  config: Symbol('params sync config'),
	  initSynced: Symbol('node initial synced')
	}
	const watchedNodes = new Set()

	window.addEventListener('popstate', onPopState)

	function onPopState (ev) {
	  for (let node of watchedNodes) {
	    if (document.body.contains(node)) { // TODO -> refine this a bit! I need a better check
	      syncStateWithParams(node)
	      syncParamsWithState(node, false)
	    }
	  }
	}

	module.exports = function paramsFactory (config) {
	  function params (node, state, next) {
	    node[secret.config] = config
	    watchedNodes.add(node)
	    node.$cleanup(unwatch)

	    syncStateWithParams(node)
	    next()
	    syncParamsWithState(node, false)
	    node.$observe(syncParamsWithState, node, true)
	  }
	  params.$name = 'params'
	  params.$require = ['observe']
	  return params
	}

	function unwatch () {
	  watchedNodes.delete(this)
	}

	function syncStateWithParams (node) {
	  const params = history.state.params
	  const state = node.$state
	  const config = node[secret.config]

	  for (let paramName in config) {
	    const param = params[paramName] || config[paramName].default
	    if (config[paramName].required && param === undefined) {
	      throw new Error(`${paramName} is a required parameter`)
	    }
	    const type = config[paramName].type
	    if (state[paramName] !== param) {
	      if (param === undefined) {
	        state[paramName] = undefined
	      } else if (type === 'number') {
	        state[paramName] = Number(param)
	      } else if (type === 'boolean') {
	        state[paramName] = Boolean(param)
	      } else if (type === 'date') {
	        state[paramName] = new Date(param)
	      } else {
	        state[paramName] = decodeURI(param)
	      }
	    }
	  }
	}

	function syncParamsWithState (node, shouldUpdateHistory) {
	  const params = history.state.params
	  const state = node.$state
	  const config = node[secret.config]
	  let newParams = {}
	  let paramsChanged = false
	  let historyChanged = false

	  for (let paramName in config) {
	    if (params[paramName] !== state[paramName]) {
	      if (config[paramName].readOnly) {
	        throw new Error(`${paramName} is readOnly`)
	      }
	      newParams[paramName] = state[paramName]
	      paramsChanged = true
	      if (config[paramName].history && shouldUpdateHistory) {
	        historyChanged = true
	      }
	    }
	  }
	  if (paramsChanged) {
	    updateHistory(newParams, historyChanged)
	  }
	}

	function updateHistory (params, historyChanged) {
	  params = Object.assign({}, history.state.params, params)

	  const url = location.pathname + paramsToQuery(params)
	  if (historyChanged) {
	    history.pushState({route: history.state.route, params}, '', url)
	  } else {
	    history.replaceState({route: history.state.route, params}, '', url)
	  }
	}

	function paramsToQuery (params) {
	  let query = ''
	  for (let paramName in params) {
	    const param = params[paramName]
	    if (param !== undefined) {
	      query += `${paramName}=${param}&`
	    }
	  }
	  if (query !== '') {
	    query = '?' + query.slice(0, -1)
	  }
	  return query
	}


/***/ },
/* 33 */
/***/ function(module, exports) {

	'use strict'

	const secret = {
	  config: Symbol('ref config')
	}

	updateHistory(pathToRoute(location.pathname), queryToParams(location.search), {history: false})

	function ref (elem) {
	  if (elem.nodeType !== 1) return

	  elem.$route = $route
	  if (elem.tagName === 'A') {
	    elem.$attribute('iref', irefAttribute)
	    elem.$attribute('iref-params', irefParamsAttribute)
	    elem.$attribute('iref-options', irefOptionsAttribute)
	  }
	}
	ref.$name = 'ref'
	ref.$require = ['attributes']
	module.exports = ref

	function irefAttribute (path) {
	  const config = this[secret.config] = this[secret.config] || {}
	  config.path = path

	  let route = pathToRoute(path)
	  if (route.some(filterRelativeTokens)) {
	    route = relativeToAbsoluteRoute(this, route)
	  }
	  this.href = routeToPath(route) + (this.search || '')
	  this.addEventListener('click', onClick, true)
	}

	function irefParamsAttribute (params) {
	  const config = this[secret.config] = this[secret.config] || {}
	  config.params = params
	  this.href = (this.pathname || '') + paramsToQuery(params)
	  this.addEventListener('click', onClick, true)
	}

	function onClick (ev) {
	  const config = this[secret.config]
	  if (config) {
	    this.$route(config.path, config.params, config.options)
	    ev.preventDefault()
	  }
	}

	function irefOptionsAttribute (options) {
	  const config = this[secret.config] = this[secret.config] || {}
	  config.options = options
	}

	function $route (path, params, options) {
	  params = params || {}
	  options = options || {}
	  let route = pathToRoute(path)
	  if (route.some(filterRelativeTokens)) {
	    route = relativeToAbsoluteRoute(this, route)
	  }
	  updateHistory(route, params, options)
	  window.scroll(0, 0)
	}

	function relativeToAbsoluteRoute (node, relativeRoute) {
	  let router = findParentRouter(node)
	  let routerLevel = router ? router.$routerLevel : 0

	  for (let token of relativeRoute) {
	    if (token === '..') routerLevel--
	  }
	  if (routerLevel < 0) {
	    throw new Error('invalid relative route')
	  }

	  const currentRoute = []
	  while (router) {
	    currentRoute.unshift(router.$currentView)
	    router = findParentRouter(router)
	  }
	  const route = relativeRoute.filter(filterAbsoluteTokens)
	  return currentRoute.slice(0, routerLevel).concat(route)
	}

	function filterAbsoluteTokens (token) {
	  return (token !== '..' && token !== '.')
	}

	function filterRelativeTokens (token) {
	  return (token === '..' || token === '.')
	}

	function filterEmptyTokens (token) {
	  return (token !== '')
	}

	function findParentRouter (node) {
	  node = node.parentNode
	  while (node && node.$routerLevel === undefined) {
	    node = node.parentNode
	  }
	  return node
	}

	function updateHistory (route, params, options) {
	  if (options.inherit) {
	    params = Object.assign({}, history.state.params, params)
	  }

	  const url = routeToPath(route) + paramsToQuery(params)
	  if (options.history === false) {
	    history.replaceState({route, params}, '', url)
	  } else {
	    history.pushState({route, params}, '', url)
	  }

	  const eventConfig = {bubbles: true, cancelable: false }
	  document.dispatchEvent(new Event('popstate', eventConfig))
	}

	function routeToPath (route) {
	  return route ? '/' + route.join('/') : ''
	}

	function pathToRoute (path) {
	  return path.split('/').filter(filterEmptyTokens)
	}

	function paramsToQuery (params) {
	  params = params || {}
	  let query = ''
	  for (let paramName in params) {
	    const param = params[paramName]
	    if (param !== undefined) {
	      query += `${paramName}=${param}&`
	    }
	  }
	  if (query !== '') {
	    query = '?' + query.slice(0, -1)
	  }
	  return query
	}

	function queryToParams (query) {
	  if (query[0] === '?') {
	    query = query.slice(1)
	  }
	  query = query.split('&')

	  const params = {}
	  for (let keyValue of query) {
	    keyValue = keyValue.split('=')
	    if (keyValue.length === 2) {
	      params[keyValue[0]] = keyValue[1]
	    }
	  }
	  return params
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const observer = __webpack_require__(35)

	function observe (node, state) {
	  node.$contextState = observer.observable(node.$contextState)
	  node.$state = observer.observable(node.$state)

	  node.$observe = $observe
	  node.$queue = $queue
	  node.$unobserve = observer.unobserve
	}
	observe.$name = 'observe'
	module.exports = observe

	function $observe (fn, ...args) {
	  args.unshift(fn, this)
	  const signal = observer.observe.apply(null, args)
	  this.$cleanup(observer.unobserve, signal)
	  return signal
	}

	function $queue (fn, ...args) {
	  args.unshift(fn, this)
	  return observer.queue.apply(null, args)
	}


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = __webpack_require__(36)


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const nextTick = __webpack_require__(37)
	const builtIns = __webpack_require__(38)
	const wellKnowSymbols = __webpack_require__(43)

	const proxies = new WeakMap()
	const observers = new WeakMap()
	const queuedObservers = new Set()
	const enumerate = Symbol('enumerate')
	let queued = false
	let currentObserver
	const handlers = {get, ownKeys, set, deleteProperty}

	module.exports = {
	  observe,
	  unobserve,
	  queue,
	  observable,
	  isObservable
	}

	function observe (fn, context, ...args) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  args = args.length ? args : undefined
	  const observer = {fn, context, args, observedKeys: []}
	  queueObserver(observer)
	  return observer
	}

	function unobserve (observer) {
	  if (typeof observer === 'object') {
	    if (observer.observedKeys) {
	      observer.observedKeys.forEach(unobserveKey, observer)
	    }
	    observer.fn = observer.context = observer.args = observer.observedKeys = undefined
	  }
	}

	function queue (fn, context, ...args) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('first argument must be a function')
	  }
	  args = args.length ? args : undefined
	  const observer = {fn, context, args, once: true}
	  queueObserver(observer)
	  return observer
	}

	function observable (obj) {
	  obj = obj || {}
	  if (typeof obj !== 'object') {
	    throw new TypeError('first argument must be an object or undefined')
	  }
	  return proxies.get(obj) || toObservable(obj)
	}

	function toObservable (obj) {
	  let observable
	  const builtIn = builtIns.get(obj.constructor)
	  if (typeof builtIn === 'function') {
	    observable = builtIn(obj, registerObserver, queueObservers)
	  } else if (!builtIn) {
	    observable = new Proxy(obj, handlers)
	  } else {
	    observable = obj
	  }
	  proxies.set(obj, observable)
	  proxies.set(observable, observable)
	  observers.set(obj, new Map())
	  return observable
	}

	function isObservable (obj) {
	  if (typeof obj !== 'object') {
	    throw new TypeError('first argument must be an object')
	  }
	  return (proxies.get(obj) === obj)
	}

	function get (target, key, receiver) {
	  if (key === '$raw') return target
	  const result = Reflect.get(target, key, receiver)
	  if (typeof key === 'symbol' && wellKnowSymbols.has(key)) {
	    return result
	  }
	  const isObject = (typeof result === 'object' && result)
	  const observable = isObject && proxies.get(result)
	  if (currentObserver) {
	    registerObserver(target, key)
	    if (isObject) {
	      return observable || toObservable(result)
	    }
	  }
	  return observable || result
	}

	function registerObserver (target, key) {
	  if (currentObserver) {
	    const observersForTarget = observers.get(target)
	    let observersForKey = observersForTarget.get(key)
	    if (!observersForKey) {
	      observersForKey = new Set()
	      observersForTarget.set(key, observersForKey)
	    }
	    if (!observersForKey.has(currentObserver)) {
	      observersForKey.add(currentObserver)
	      currentObserver.observedKeys.push(observersForKey)
	    }
	  }
	}

	function ownKeys (target) {
	  registerObserver(target, enumerate)
	  return Reflect.ownKeys(target)
	}

	function set (target, key, value, receiver) {
	  if (key === 'length' || value !== Reflect.get(target, key, receiver)) {
	    queueObservers(target, key)
	    queueObservers(target, enumerate)
	  }
	  if (typeof value === 'object' && value) {
	    value = value.$raw || value
	  }
	  return Reflect.set(target, key, value, receiver)
	}

	function deleteProperty (target, key) {
	  if (Reflect.has(target, key)) {
	    queueObservers(target, key)
	    queueObservers(target, enumerate)
	  }
	  return Reflect.deleteProperty(target, key)
	}

	function queueObservers (target, key) {
	  const observersForKey = observers.get(target).get(key)
	  if (observersForKey) {
	    observersForKey.forEach(queueObserver)
	  }
	}

	function queueObserver (observer) {
	  if (!queued) {
	    nextTick(runObservers)
	    queued = true
	  }
	  queuedObservers.add(observer)
	}

	function runObservers () {
	  queuedObservers.forEach(runObserver)
	  queuedObservers.clear()
	  queued = false
	}

	function runObserver (observer) {
	  if (observer.fn) {
	    if (observer.once) {
	      observer.fn.apply(observer.context, observer.args)
	      unobserve(observer)
	    } else {
	      try {
	        currentObserver = observer
	        observer.fn.apply(observer.context, observer.args)
	      } finally {
	        currentObserver = undefined
	      }
	    }
	  }
	}

	function unobserveKey (observersForKey) {
	  observersForKey.delete(this)
	}


/***/ },
/* 37 */
/***/ function(module, exports) {

	'use strict'

	let promise = Promise.resolve()
	let mutateWithTask
	let currTask

	module.exports = function nextTick (task) {
	  currTask = task
	  if (mutateWithTask) {
	    mutateWithTask()
	  } else {
	    promise = promise.then(task)
	  }
	}

	if (typeof MutationObserver !== 'undefined') {
	  let counter = 0
	  const observer = new MutationObserver(onTask)
	  const textNode = document.createTextNode(String(counter))
	  observer.observe(textNode, {characterData: true})

	  mutateWithTask = function mutateWithTask () {
	    counter = (counter + 1) % 2
	    textNode.textContent = counter
	  }
	}

	function onTask () {
	  if (currTask) {
	    currTask()
	  }
	}


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const MapShim = __webpack_require__(39)
	const SetShim = __webpack_require__(40)
	const WeakMapShim = __webpack_require__(41)
	const WeakSetShim = __webpack_require__(42)

	module.exports = new Map([
	  [Map, MapShim],
	  [Set, SetShim],
	  [WeakMap, WeakMapShim],
	  [WeakSet, WeakSetShim],
	  [Date, true],
	  [RegExp, true]
	])


/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict'

	const native = Map.prototype
	const masterKey = Symbol('Map master key')

	const getters = ['has', 'get']
	const iterators = ['forEach', 'keys', 'values', 'entries', Symbol.iterator]
	const all = ['set', 'delete', 'clear'].concat(getters, iterators)

	module.exports = function shim (target, registerObserver, queueObservers) {
	  target.$raw = {}

	  for (let method of all) {
	    target.$raw[method] = function () {
	      native[method].apply(target, arguments)
	    }
	  }

	  for (let getter of getters) {
	    target[getter] = function (key) {
	      registerObserver(this, key)
	      return native[getter].apply(this, arguments)
	    }
	  }

	  for (let iterator of iterators) {
	    target[iterator] = function () {
	      registerObserver(this, masterKey)
	      return native[iterator].apply(this, arguments)
	    }
	  }

	  target.set = function (key, value) {
	    if (this.get(key) !== value) {
	      queueObservers(this, key)
	      queueObservers(this, masterKey)
	    }
	    return native.set.apply(this, arguments)
	  }

	  target.delete = function (key) {
	    if (this.has(key)) {
	      queueObservers(this, key)
	      queueObservers(this, masterKey)
	    }
	    return native.delete.apply(this, arguments)
	  }

	  target.clear = function () {
	    if (this.size) {
	      queueObservers(this, masterKey)
	    }
	    return native.clear.apply(this, arguments)
	  }

	  return target
	}


/***/ },
/* 40 */
/***/ function(module, exports) {

	'use strict'

	const native = Set.prototype
	const masterValue = Symbol('Set master value')

	const getters = ['has']
	const iterators = ['forEach', 'keys', 'values', 'entries', Symbol.iterator]
	const all = ['add', 'delete', 'clear'].concat(getters, iterators)

	module.exports = function shim (target, registerObserver, queueObservers) {
	  target.$raw = {}

	  for (let method of all) {
	    target.$raw[method] = function () {
	      native[method].apply(target, arguments)
	    }
	  }

	  for (let getter of getters) {
	    target[getter] = function (value) {
	      registerObserver(this, value)
	      return native[getter].apply(this, arguments)
	    }
	  }

	  for (let iterator of iterators) {
	    target[iterator] = function () {
	      registerObserver(this, masterValue)
	      return native[iterator].apply(this, arguments)
	    }
	  }

	  target.add = function (value) {
	    if (!this.has(value)) {
	      queueObservers(this, value)
	      queueObservers(this, masterValue)
	    }
	    return native.add.apply(this, arguments)
	  }

	  target.delete = function (value) {
	    if (this.has(value)) {
	      queueObservers(this, value)
	      queueObservers(this, masterValue)
	    }
	    return native.delete.apply(this, arguments)
	  }

	  target.clear = function () {
	    if (this.size) {
	      queueObservers(this, masterValue)
	    }
	    return native.clear.apply(this, arguments)
	  }

	  return target
	}


/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict'

	const native = WeakMap.prototype

	const getters = ['has', 'get']
	const all = ['set', 'delete'].concat(getters)

	module.exports = function shim (target, registerObserver, queueObservers) {
	  target.$raw = {}

	  for (let method of all) {
	    target.$raw[method] = function () {
	      native[method].apply(target, arguments)
	    }
	  }

	  for (let getter of getters) {
	    target[getter] = function (key) {
	      registerObserver(this, key)
	      return native[getter].apply(this, arguments)
	    }
	  }

	  target.set = function (key, value) {
	    if (this.get(key) !== value) {
	      queueObservers(this, key)
	    }
	    return native.set.apply(this, arguments)
	  }

	  target.delete = function (key) {
	    if (this.has(key)) {
	      queueObservers(this, key)
	    }
	    return native.delete.apply(this, arguments)
	  }

	  return target
	}


/***/ },
/* 42 */
/***/ function(module, exports) {

	'use strict'

	const native = WeakSet.prototype

	const getters = ['has']
	const all = ['add', 'delete'].concat(getters)

	module.exports = function shim (target, registerObserver, queueObservers) {
	  target.$raw = {}

	  for (let method of all) {
	    target.$raw[method] = function () {
	      native[method].apply(target, arguments)
	    }
	  }

	  for (let getter of getters) {
	    target[getter] = function (value) {
	      registerObserver(this, value)
	      return native[getter].apply(this, arguments)
	    }
	  }

	  target.add = function (value) {
	    if (!this.has(value)) {
	      queueObservers(this, value)
	    }
	    return native.add.apply(this, arguments)
	  }

	  target.delete = function (value) {
	    if (this.has(value)) {
	      queueObservers(this, value)
	    }
	    return native.delete.apply(this, arguments)
	  }

	  return target
	}


/***/ },
/* 43 */
/***/ function(module, exports) {

	'use strict'

	const wellKnowSymbols = new Set()

	for (let key of Object.getOwnPropertyNames(Symbol)) {
	  const value = Symbol[key]
	  if (typeof value === 'symbol') {
	    wellKnowSymbols.add(value)
	  }
	}

	module.exports = wellKnowSymbols


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  app: __webpack_require__(45),
	  page: __webpack_require__(46),
	  rendered: __webpack_require__(47),
	  router: __webpack_require__(48)
	}


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const component = __webpack_require__(3)
	const middlewares = __webpack_require__(14)

	module.exports = function app (config) {
	  config = Object.assign({root: true, isolate: 'middlewares'}, config)

	  return component(config)
	    .useOnContent(middlewares.observe)
	    .useOnContent(middlewares.interpolate)
	    .useOnContent(middlewares.attributes)
	    .useOnContent(middlewares.style)
	    .useOnContent(middlewares.animate)
	    .useOnContent(middlewares.ref)
	    .useOnContent(middlewares.flow)
	    .useOnContent(middlewares.bindable)
	    .useOnContent(middlewares.bind)
	    .useOnContent(middlewares.events)
	}


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const component = __webpack_require__(3)
	const middlewares = __webpack_require__(14)

	module.exports = function page (config) {
	  config = config || {}

	  return component(config)
	    .use(middlewares.render(config))
	    .use(middlewares.params(config.params))
	}


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const component = __webpack_require__(3)
	const middlewares = __webpack_require__(14)

	module.exports = function rendered (config) {
	  config = config || {}

	  return component(config)
	    .use(middlewares.render(config))
	}


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const component = __webpack_require__(3)
	const middlewares = __webpack_require__(14)

	module.exports = function router (config) {
	  config = Object.assign({state: false}, config)

	  return component(config)
	    .use(middlewares.route)
	}


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  compiler: __webpack_require__(16),
	  observer: __webpack_require__(35),
	  dom: __webpack_require__(26)
	}


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)
	const filters = __webpack_require__(51)

	for (let name in filters) {
	  compiler.filter(name, filters[name])
	}


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  capitalize: __webpack_require__(52),
	  uppercase: __webpack_require__(53),
	  lowercase: __webpack_require__(54),
	  unit: __webpack_require__(55),
	  json: __webpack_require__(56),
	  slice: __webpack_require__(57),
	  date: __webpack_require__(58),
	  time: __webpack_require__(59),
	  datetime: __webpack_require__(60)
	}


/***/ },
/* 52 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function capitalize (value) {
	  if (value === undefined) {
	    return value
	  }
	  value = String(value)
	  return value.charAt(0).toUpperCase() + value.slice(1)
	}


/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function uppercase (value) {
	  if (value === undefined) {
	    return value
	  }
	  return String(value).toUpperCase()
	}


/***/ },
/* 54 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function lowercase (value) {
	  if (value === undefined) {
	    return value
	  }
	  return String(value).toLowerCase()
	}


/***/ },
/* 55 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function unit (value, unitName, postfix) {
	  unitName = unitName || 'item'
	  postfix = postfix || 's'
	  if (isNaN(value)) {
	    return value + ' ' + unitName
	  }
	  let result = value + ' ' + unitName
	  if (value !== 1) result += postfix
	  return result
	}


/***/ },
/* 56 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function json (value, indent) {
	  if (value === undefined) {
	    return value
	  }
	  return JSON.stringify(value, null, indent)
	}


/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function slice (value, begin, end) {
	  if (value === undefined) {
	    return value
	  }
	  return value.slice(begin, end)
	}


/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function date (value) {
	  if (value instanceof Date) {
	    return value.toLocaleDateString()
	  }
	  return value
	}


/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function time (value) {
	  if (value instanceof Date) {
	    return value.toLocaleTimeString()
	  }
	  return value
	}


/***/ },
/* 60 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function datetime (value) {
	  if (value instanceof Date) {
	    return value.toLocaleString()
	  }
	  return value
	}


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const compiler = __webpack_require__(16)
	const limiters = __webpack_require__(62)

	for (let name in limiters) {
	  compiler.limiter(name, limiters[name])
	}


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	module.exports = {
	  if: __webpack_require__(63),
	  delay: __webpack_require__(64),
	  debounce: __webpack_require__(65),
	  throttle: __webpack_require__(66),
	  key: __webpack_require__(67)
	}


/***/ },
/* 63 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function ifLimiter (next, context, condition) {
	  if (condition) {
	    next()
	  }
	}


/***/ },
/* 64 */
/***/ function(module, exports) {

	'use strict'

	module.exports = function delay (next, context, time) {
	  if (time === undefined || isNaN(time)) {
	    time = 200
	  }
	  setTimeout(next, time)
	}


/***/ },
/* 65 */
/***/ function(module, exports) {

	'use strict'

	const timer = Symbol('debounce timer')

	module.exports = function debounce (next, context, delay) {
	  if (delay === undefined || isNaN(delay)) {
	    delay = 200
	  }
	  clearTimeout(context[timer])
	  context[timer] = setTimeout(next, delay)
	}


/***/ },
/* 66 */
/***/ function(module, exports) {

	'use strict'

	const lastExecution = Symbol('throttle last execution')

	module.exports = function throttle (next, context, threshold) {
	  if (threshold === undefined || isNaN(threshold)) {
	    threshold = 200
	  }

	  const last = context[lastExecution]
	  const now = Date.now()
	  if (!last || (last + threshold) < now) {
	    context[lastExecution] = now
	    next()
	  }
	}


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	const stringToCode = __webpack_require__(68)

	module.exports = function keyLimiter (next, context, ...keys) {
	  if (!(context.$event instanceof KeyboardEvent)) {
	    return next()
	  }

	  const keyCodes = keys.map(stringToCode)
	  const keyCode = context.$event.keyCode || context.$event.which
	  if (keyCodes.indexOf(keyCode) !== -1) {
	    next()
	  }
	}


/***/ },
/* 68 */
/***/ function(module, exports) {

	// Source: http://jsfiddle.net/vWx8V/
	// http://stackoverflow.com/questions/5603195/full-list-of-javascript-keycodes

	/**
	 * Conenience method returns corresponding value for given keyName or keyCode.
	 *
	 * @param {Mixed} keyCode {Number} or keyName {String}
	 * @return {Mixed}
	 * @api public
	 */

	exports = module.exports = function(searchInput) {
	  // Keyboard Events
	  if (searchInput && 'object' === typeof searchInput) {
	    var hasKeyCode = searchInput.which || searchInput.keyCode || searchInput.charCode
	    if (hasKeyCode) searchInput = hasKeyCode
	  }

	  // Numbers
	  if ('number' === typeof searchInput) return names[searchInput]

	  // Everything else (cast to string)
	  var search = String(searchInput)

	  // check codes
	  var foundNamedKey = codes[search.toLowerCase()]
	  if (foundNamedKey) return foundNamedKey

	  // check aliases
	  var foundNamedKey = aliases[search.toLowerCase()]
	  if (foundNamedKey) return foundNamedKey

	  // weird character?
	  if (search.length === 1) return search.charCodeAt(0)

	  return undefined
	}

	/**
	 * Get by name
	 *
	 *   exports.code['enter'] // => 13
	 */

	var codes = exports.code = exports.codes = {
	  'backspace': 8,
	  'tab': 9,
	  'enter': 13,
	  'shift': 16,
	  'ctrl': 17,
	  'alt': 18,
	  'pause/break': 19,
	  'caps lock': 20,
	  'esc': 27,
	  'space': 32,
	  'page up': 33,
	  'page down': 34,
	  'end': 35,
	  'home': 36,
	  'left': 37,
	  'up': 38,
	  'right': 39,
	  'down': 40,
	  'insert': 45,
	  'delete': 46,
	  'command': 91,
	  'left command': 91,
	  'right command': 93,
	  'numpad *': 106,
	  'numpad +': 107,
	  'numpad -': 109,
	  'numpad .': 110,
	  'numpad /': 111,
	  'num lock': 144,
	  'scroll lock': 145,
	  'my computer': 182,
	  'my calculator': 183,
	  ';': 186,
	  '=': 187,
	  ',': 188,
	  '-': 189,
	  '.': 190,
	  '/': 191,
	  '`': 192,
	  '[': 219,
	  '\\': 220,
	  ']': 221,
	  "'": 222
	}

	// Helper aliases

	var aliases = exports.aliases = {
	  'windows': 91,
	  '⇧': 16,
	  '⌥': 18,
	  '⌃': 17,
	  '⌘': 91,
	  'ctl': 17,
	  'control': 17,
	  'option': 18,
	  'pause': 19,
	  'break': 19,
	  'caps': 20,
	  'return': 13,
	  'escape': 27,
	  'spc': 32,
	  'pgup': 33,
	  'pgdn': 34,
	  'ins': 45,
	  'del': 46,
	  'cmd': 91
	}


	/*!
	 * Programatically add the following
	 */

	// lower case chars
	for (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32

	// numbers
	for (var i = 48; i < 58; i++) codes[i - 48] = i

	// function keys
	for (i = 1; i < 13; i++) codes['f'+i] = i + 111

	// numpad keys
	for (i = 0; i < 10; i++) codes['numpad '+i] = i + 96

	/**
	 * Get by code
	 *
	 *   exports.name[13] // => 'Enter'
	 */

	var names = exports.names = exports.title = {} // title for backward compat

	// Create reverse mapping
	for (i in codes) names[codes[i]] = i

	// Add aliases
	for (var alias in aliases) {
	  codes[alias] = aliases[alias]
	}


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	nx.components.app()
	  .use(nx.middlewares.render({
	    template: __webpack_require__(70),
	    style: __webpack_require__(71)
	  }))
	  .register('intro-app')

	nx.component()
	  .use(nx.middlewares.route)
	  .register('router-comp')


/***/ },
/* 70 */
/***/ function(module, exports) {

	module.exports = "<a iref=\"clock\">Clock</a>\n<a iref=\"hello\">Greeting</a>\n<router-comp>\n  <clock-comp route=\"clock\" default-route></clock-comp>\n  <greeting-comp route=\"hello\"></greeting-comp>\n</router-comp>\n"

/***/ },
/* 71 */
/***/ function(module, exports) {

	module.exports = ":host {\n  display: block;\n  max-width: 500px;\n}\n\na {\n  cursor: pointer;\n  text-decoration: none;\n  padding: 10px 20px;\n  border-radius: 3px;\n  color: white;\n  background-color: #009688;\n  transition: background-color 0.2s ease-out;\n  display: inline-block;\n  margin-bottom: 6px;\n}\n\na:hover {\n  background-color: #03615c;\n}\n"

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	nx.component()
	  .use(nx.middlewares.render({
	    template: __webpack_require__(73)
	  }))
	  .use(tick)
	  .register('clock-comp')

	function tick (elem, state) {
	  state.date = new Date()
	  setInterval(() => state.date = new Date(), 1000)
	}


/***/ },
/* 73 */
/***/ function(module, exports) {

	module.exports = "<p>The current time is: @{date | time}</p>\n"

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict'

	nx.component()
	  .use(nx.middlewares.render({
	    template: __webpack_require__(75)
	  }))
	  .use(nx.middlewares.params({
	    name: {history: true, default: 'World'}
	  }))
	  .register('greeting-comp')


/***/ },
/* 75 */
/***/ function(module, exports) {

	module.exports = "<p>Name: <input type=\"text\" name=\"name\" bind/></p>\n<p>Hello @{name}</p>\n"

/***/ }
/******/ ]);