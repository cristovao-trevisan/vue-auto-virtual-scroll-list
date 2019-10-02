# vue-auto-virtual-scroll-list
High level component for virtual list where each item height is not known before render

[![npm version](https://badge.fury.io/js/vue-auto-virtual-scroll-list.svg)](https://badge.fury.io/js/vue-auto-virtual-scroll-list)
![package-size](https://badgen.net/bundlephobia/minzip/vue-auto-virtual-scroll-list)

## [Live Demo](https://cristovao-trevisan.github.io/vue-auto-virtual-scroll-list/)

## Properties

*Prop* | *Type* | *Required/Default* | *Description* |
:--- | :--- | :--- | :--- |
| totalHeight | Number | ✓ | Container height (px): used to calculate the # of components rendered  |
| defaultHeight | Number | ✓ | Item expected height (px). Set to your item's minimum height |
| extraItems | Number | 1 | Extra items rendered (extra items rendered to avoid empty space while scrolling) |

## Usage

### With template
```html
<template>
  <VueAutoVirtualScrollList
    :totalHeight="800"
    :defaultHeight="80"
    style="width: 100%;"
  >
    <div
      v-for="item in items"
        :style="{ height: `${item.height}px` }"
    >
      {{ item.name }}
    </div>
  </VueAutoVirtualScrollList>
</template>

<script>
import VueAutoVirtualScrollList from 'vue-auto-virtual-scroll-list'

export default {
  ...
  components: { VueAutoVirtualScrollList },
  ...
}
</script>
```

### With jsx
```jsx
import VueAutoVirtualScrollList from 'vue-auto-virtual-scroll-list'

export default {
  ...
  render(h) {
    return (
      <VueAutoVirtualScrollList
        totalHeight={800}
        defaultHeight={80}
      >
        {items.map((item) => (
          <div style={{ height: `${item.height}px` }}>
            { item.name }
          </div>
        ))}
      </VueAutoVirtualScrollList>
    )
  },
  ...
}
```

## Methods

### `setIndex(index: number)`
Scroll to the item at `index`.
This method is not yet stable or tested.

## How it works

The number of rendered components is calculated by accumulating each item height to see how many fit in
`totalHeight`. Each item height is assumed to be `defaultHeight`, until it is actually rendered.
When that happens the correct value is cached and used for later calculations

## Motivation

The worst case scenario for lists is when each item has multi-line text mixed with
other content, which make it very hard to know the component height before render happens.
This component makes it easy to use this kind of list without further problems

## TODO

* Support for infinite scroll
