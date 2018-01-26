import Vue from 'vue'
import { mount } from 'vue-test-utils'

import TestList from '../test-helpers/test-list'

Object.defineProperties(window.HTMLElement.prototype, {
  offsetHeight: {
    get() { return parseFloat(window.getComputedStyle(this).height) || 0 },
  },
})

const testHeights = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90]
const testItems = testHeights.map(height => ({ name: `Test Item #${height}`, height }))
const propsData = {
  height: 100,
  defaultHeight: 10,
  items: testItems,
  extraItems: 0,
}

/**
 * @returns {Promise.<void>}
 */
const updateList = list => new Promise((resolve) => {
  list.update() // udpate number of items
  Vue.nextTick(() => {
    list.update() // update heights
    Vue.nextTick(resolve)
  })
})

test('should cache correct rendered height', () => {
  const testList = mount(TestList, { propsData })

  expect(testList.vm.$children[0].heights.length).toBe(0)

  return updateList(testList).then(() => {
    expect(testList.vm.$children[0].heights.length).toBe(10)
    expect(testList.vm.$children[0].heights).toEqual(testHeights.slice(0, 10))
  })
})

test('should calculate correct offset', () => {
  const testList = mount(TestList, { propsData })

  expect(testList.vm.$children[0].heights.length).toBe(0) // this includes empty divs

  return updateList(testList).then(() => {
    expect(testList.vm.$children[0].offset).toBe(0)
    // set new scroll
    testList.vm.$children[0].$el.scrollTop = 40
    testList.vm.$children[0].$el.onscroll()
    return updateList(testList).then(() => expect(testList.vm.$children[0].offset).toBe(2))
  })
})

test('should render only necessary elements', () => {
  const testList = mount(TestList, { propsData })

  expect(testList.vm.$el.children.length).toBe(12) // this includes empty divs
  expect(testList.vm.$children[0].$children.length).toBe(10) // only items rendered (100 / 10)

  return updateList(testList)
    .then(() => expect(testList.vm.$children[0].$children.length).toBe(5))
})

test('should reset when items length changes', () => {
  const testList = mount(TestList, { propsData })

  expect(testList.vm.$children[0].heights.length).toBe(0)

  return updateList(testList).then(() => new Promise((resolve) => {
    expect(testList.vm.$children[0].heights.length).toBe(10)
    // set scroll
    testList.vm.$children[0].$el.scrollTop = 40
    testList.vm.$children[0].$el.onscroll()

    // replace props
    testList.setProps({ items: testItems.concat(95) })
    Vue.nextTick(() => {
      // test if reset worked
      expect(testList.vm.$children[0].$el.scrollTop).toBe(0)
      expect(testList.vm.$children[0].offset).toBe(0)
      expect(testList.vm.$children[0].heights).toEqual([])
      resolve()
    })
  }))
})
