import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '*',
            redirect: '/'
        },
        {
            path: '/',
            name: 'konva-test',
            component: require('@/components/KonvaTest').default
        }
    ]
})
