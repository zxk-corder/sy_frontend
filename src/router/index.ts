import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/reimbursement',
    },
    // 列表页
    {
      path: '/reimbursement',
      name: 'reimbursement-list',
      component: () => import('@/views/reimbursement/ReimbursementListView.vue'),
    },
    // 新增页
    {
      path: '/reimbursement/create',
      name: 'reimbursement-create',
      component: () => import('@/views/reimbursement/ReimbursementDetailView.vue'),
    },
    // 详情页
    {
      path: '/reimbursement/:id',
      name: 'reimbursement-detail',
      component: () => import('@/views/reimbursement/ReimbursementDetailView.vue'),
    },
  ],
})

export default router
