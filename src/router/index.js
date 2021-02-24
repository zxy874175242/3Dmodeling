import Vue from 'vue'
import Router from 'vue-router'
import DModeling from '../components/DModeling'
import GraphicDrawing from '../components/GraphicDrawing'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'DModeling',
      component: DModeling
    },
    {
      path: '/2d',
      name: 'GraphicDrawing',
      component: GraphicDrawing
    }
  ]
})
