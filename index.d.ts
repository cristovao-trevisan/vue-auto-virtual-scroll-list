import { Component } from 'vue';

interface Data {
  offset: number;
  heights: number[];
  scrollTop: number;
  numberOfItems: boolean | number;
}

interface Methods {
  reset(): void; 
}

interface Props {
  totalHeight: number;
  defaultHeight: number;
  extraItems?: number;
}

type VueAutoVirtualScrollList = Component<Data, Methods, {}, Props>

export default VueAutoVirtualScrollList
