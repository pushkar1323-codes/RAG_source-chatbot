import { Outlet } from 'react-router-dom'

import PublicFooter from '../components/layout/PublicFooter'
import PublicHeader from '../components/layout/PublicHeader'

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  )
}

export default PublicLayout