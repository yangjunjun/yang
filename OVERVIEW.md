# Repository Overview

This repository contains a tiny JavaScript module loader (`yang.js`) together with a set of
demonstration pages that experiment with basic MVVM-style data binding. The project grew out of
learning exercises inspired by the [`thin`](https://github.com/xufei/thin) framework.

## Project layout

```
yang.js          # Module loader implementation exposed as `window.yang`
demo/
  bind.html      # Demo page showing two Vue-style instances bound to the DOM
  bind.js        # Minimal MVVM/data-binding implementation used by the demos
  demo01.html    # Simple HTML page to load yang.js and demo01.js
  demo01.js      # Examples of defining and using modules with the loader
  todo.html      # Todo list demo that exercises bind.js reactivity helpers
```

## Core module loader (`yang.js`)

`yang.js` defines a global `yang` object with two methods:

* `yang.define(name, dependencies, factory)` registers a module by name. Each module keeps track of
  its dependencies and the factory function that produces its exported value. Modules are only
  stored once, so duplicate `define` calls are ignored.
* `yang.use(name)` resolves a module by name. It recursively resolves dependencies, invoking their
  factories if they have not yet been instantiated. Resolved module exports are cached as
  `module.entity` so factories run just once.

This module loader is intentionally small—there is no asynchronous loading, dependency cycle
handling, or error reporting. It is best used for educational purposes to understand how dependency
injection and lazy evaluation work in module systems. 【F:yang.js†L1-L38】

## Data-binding utilities (`demo/bind.js`)

The demo pages bundle a tiny MVVM implementation that mimics a subset of Vue.js features:

* An `Event` helper provides a basic publish/subscribe mechanism (though it is not used elsewhere in
the current code). 【F:demo/bind.js†L1-L24】
* `extend` and `clone` implement shallow/deep merge and cloning utilities, re-used to manage reactive
  state. 【F:demo/bind.js†L25-L66】
* `parseElement`, `bindType`, and helpers (`bindHTML`, `bindValue`, `bindFor`, `bindClick`) walk the
  DOM, looking for directives such as `v-value`, `v-click`, and `v-for`, and wire up watchers and DOM
  event listeners to keep the UI and data model in sync. 【F:demo/bind.js†L68-L170】
* A lightweight `VM` object wraps `$watch`, storing watcher callbacks per property and redefining the
  property via `Object.defineProperty` to trigger DOM updates on assignment. 【F:demo/bind.js†L172-L212】
* `Vue` acts as a constructor that binds the provided data model to a DOM subtree. Instantiating
  `new Vue({ el: '#app', data: { ... } })` hydrates the directives within that subtree using the
  helpers above. 【F:demo/bind.js†L214-L220】

This implementation is intentionally naïve—watchers re-render entire text nodes, arrays are cloned to
force updates, and it lacks lifecycle management. It is useful for grasping the core concepts behind
Vue’s reactivity system.

## Demo pages

The `demo` folder contains HTML pages that exercise both the module loader and the MVVM helper:

* `demo01.html`/`demo01.js` shows how to compose modules with `yang.define` and `yang.use` by
  building simple geometric shapes and a factory. 【F:demo/demo01.js†L1-L50】
* `bind.html` mounts two independent `Vue` instances onto different DOM roots, demonstrating data
  binding for text interpolation, `v-value` inputs, and click handlers. 【F:demo/bind.html†L1-L44】
* `todo.html` reuses the same `Vue` implementation to create a reactive todo list with `v-for` to
  render lists, `v-click` for events, and manual cloning to trigger change detection on arrays.
  【F:demo/todo.html†L1-L38】

## Suggested next steps

New contributors can explore these directions to deepen their understanding or expand the project:

1. **Module loader improvements** – add error handling, detect circular dependencies, or support
   asynchronous module definitions similar to AMD loaders.
2. **Reactivity system enhancements** – experiment with `Proxy`-based observation, batched updates,
   or template compilation to minimize DOM reflows.
3. **Testing & tooling** – introduce unit tests (e.g., Jest) for the loader and MVVM helpers, and set
   up a build pipeline with bundlers like Vite or Rollup for more complex demos.
4. **Documentation & tutorials** – expand the README with tutorials that walk through building a
   custom directive or extending the module loader.

These improvements will make the repository a richer learning resource while keeping the spirit of a
lightweight, educational playground intact.
