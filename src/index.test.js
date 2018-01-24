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

test('should cache correct rendered height', (done) => {
  const testList = mount(TestList, { propsData })

  // test initial render
  expect(testList.vm.$children[0].heights.length).toBe(0)

  // test render after heights are read
  testList.update() // udpate number of items
  Vue.nextTick(() => {
    testList.update() // update heights
    Vue.nextTick(() => {
      expect(testList.vm.$children[0].heights.length).toBe(10)
      expect(testList.vm.$children[0].heights).toEqual(testHeights.slice(0, 10))
      done()
    })
  })
})

test('should calculate correct offset', (done) => {
  const testList = mount(TestList, { propsData })

  // test initial render
  expect(testList.vm.$children[0].heights.length).toBe(0) // this includes empty divs

  // test render after heights are read
  testList.update() // udpate number of items
  Vue.nextTick(() => {
    testList.update() // update heights
    Vue.nextTick(() => {
      expect(testList.vm.$children[0].offset).toBe(0)
      // set new scroll
      testList.vm.$children[0].$el.scrollTop = 40
      testList.vm.$children[0].$el.onscroll()
      Vue.nextTick(() => {
        expect(testList.vm.$children[0].offset).toBe(2)
        done()
      })
    })
  })
})

test('should render only necessary elements', (done) => {
  const testList = mount(TestList, { propsData })

  // test initial render
  expect(testList.vm.$el.children.length).toBe(12) // this includes empty divs
  expect(testList.vm.$children[0].$children.length).toBe(10) // only items rendered (100 / 10)

  // test render after heights are read
  testList.update() // udpate number of items
  Vue.nextTick(() => {
    testList.update() // update heights
    Vue.nextTick(() => {
      // only 5 items rendered (10 + 15 + 20 + 25 + 30 = 100)
      expect(testList.vm.$children[0].$children.length).toBe(5)
      done()
    })
  })
})

test('should reset when items length changes', (done) => {
  const testList = mount(TestList, { propsData })

  // test initial render
  expect(testList.vm.$children[0].heights.length).toBe(0)

  // test render after heights are read
  testList.update() // udpate number of items
  Vue.nextTick(() => {
    testList.update() // update heights
    Vue.nextTick(() => {
      expect(testList.vm.$children[0].heights.length).toBe(10)
      // set scroll
      testList.vm.$children[0].$el.scrollTop = 40
      testList.vm.$children[0].$el.onscroll()

      Vue.nextTick(() => {
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
    })
  })
})
