import Vue from 'vue'
import { mount } from 'vue-test-utils'

import TestList from '../test-helpers/test-list'

Object.defineProperties(window.HTMLElement.prototype, {
  offsetHeight: {
    get() { return parseFloat(window.getComputedStyle(this).height) || 0 },
  },
})

const heightToItemMapper = height => ({ name: `Test Item #${height}`, height })
const testHeights = [10, 15, 20, 25, 30, 40, 50, 120, 70, 80, 90, 40, 20, 15, 70, 20.2, 12.7, 60]
const testItems = testHeights.map(heightToItemMapper)
const renderCount = 10
const height = 100
const propsData = { height, items: testItems, defaultHeight: height / renderCount, extraItems: 0 }
const testItemsCalculations = testHeights.map((item, index) => {
  let accHeight = 0
  let current = index
  while (testHeights[current] && accHeight < propsData.height) {
    accHeight += testHeights[current]
    current += 1
  }
  const scroll = testHeights.slice(0, index).reduce((a, b) => a + b, 0)
  return { item, accHeight, scroll, items: current - index }
})
// console.log(testItemsCalculations)

/**
 * @returns {Promise.<void>}
 */
const updateList = list => new Promise((resolve) => {
  list.vm.$children[0].$el.onscroll()
  list.update() // update number of items
  Vue.nextTick(() => {
    list.update() // update heights
    Vue.nextTick(resolve)
  })
})

test('should cache correct rendered height', async () => {
  const testList = mount(TestList, { propsData })

  expect(testList.vm.$children[0].heights.length).toBe(0)

  await updateList(testList)
  expect(testList.vm.$children[0].heights.length).toBe(renderCount)
  expect(testList.vm.$children[0].heights).toEqual(testHeights.slice(0, renderCount))
})

test('should calculate correct offset', async () => {
  const testList = mount(TestList, { propsData })

  expect(testList.vm.$children[0].heights.length).toBe(0)

  await updateList(testList)
  expect(testList.vm.$children[0].offset).toBe(0)
  testList.vm.$children[0].$el.scrollTop = 40
  await updateList(testList)
  expect(testList.vm.$children[0].offset).toBe(2)
})

test('should set correct space above', async () => {
  const index = 6
  const testList = mount(TestList, { propsData })
  const { scroll } = testItemsCalculations[index]

  expect(testList.vm.$el.children[0].style.height).toBe('0px')
  await updateList(testList)
  testList.vm.$children[0].$el.scrollTop = scroll + (testHeights[index - 1] / 2)
  await updateList(testList)

  expect(testList.vm.$el.children[0].style.height).toBe(`${scroll}px`)
})

test('should set correct space after with extra items', async () => {
  const heights = [10, 10, 30, 20, 70, 30.43, 30.30]
  const items = heights.map(heightToItemMapper)
  const testList = mount(TestList, {
    propsData: {
      ...propsData,
      height: 20,
      defaultHeight: 10,
      items,
      extraItems: 2,
    },
  })

  await updateList(testList)
  testList.vm.$children[0].$el.scrollTop = 20
  await updateList(testList)
  testList.vm.$children[0].$el.scrollTop = 0
  await updateList(testList)

  const spaceAfterItem = testList.vm.$el.children[testList.vm.$el.children.length - 1]
  expect(spaceAfterItem.style.height).toBe('90px')
})

test('should render extra items', async () => {
  const extraItems = 4
  const testList = mount(TestList, { propsData: { ...propsData, extraItems } })

  expect(testList.vm.$children[0].$children.length).toBe(renderCount + extraItems)
  await updateList(testList)
  expect(testList.vm.$children[0].$children.length).toBe(5 + extraItems)
})

describe('should render only necessary elements', () => {
  test('manual test', async () => {
    const testList = mount(TestList, { propsData })

    expect(testList.vm.$el.children.length).toBe(renderCount + 2)
    expect(testList.vm.$children[0].$children.length).toBe(renderCount)

    await updateList(testList)
    expect(testList.vm.$children[0].$children.length).toBe(5)
  })

  test('for every calculation', async () => {
    const testList = mount(TestList, { propsData })

    for (let index = 0; index < testItemsCalculations.length; index += 1) {
      /* eslint-disable no-await-in-loop */
      const expected = testItemsCalculations[index]
      // set new scroll
      testList.vm.$children[0].$el.scrollTop = expected.scroll
      // re-render
      await updateList(testList)
      expect(testList.vm.$children[0].$children.length).toBe(expected.items)
      expect(testList.vm.$children[0].offset).toBe(index)
    }
  })
})

test('should reset when items length changes', async (done) => {
  const testList = mount(TestList, { propsData })

  expect(testList.vm.$children[0].heights.length).toBe(0)

  await updateList(testList)
  expect(testList.vm.$children[0].heights.length).toBe(renderCount)
  testList.vm.$children[0].$el.scrollTop = 40

  // replace props
  testList.setProps({ items: testItems.concat(95) })
  Vue.nextTick(() => {
    // test if reset worked
    expect(testList.vm.$children[0].$el.scrollTop).toBe(0)
    expect(testList.vm.$children[0].offset).toBe(0)
    expect(testList.vm.$children[0].heights).toEqual([])
    done()
  })
})

test('should work if item height is greater than total height', async () => {
  const items = [110, 10, 200, 50].map(heightToItemMapper)
  const props = { height: 100, items, defaultHeight: 10, extraItems: 0 }
  const testList = mount(TestList, { propsData: props })

  await updateList(testList)
  expect(testList.vm.$children[0].$children.length).toBe(1)

  testList.vm.$children[0].$el.scrollTop = 30
  await updateList(testList)
  expect(testList.vm.$children[0].$children.length).toBe(3)

  testList.vm.$children[0].$el.scrollTop = 230
  await updateList(testList)
  expect(testList.vm.$children[0].$children.length).toBe(2)
})
