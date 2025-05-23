import PropTypes from 'prop-types'
// hooks
import useAuth from '../hooks/useAuth'
// routes
import { PATH_DASHBOARD } from '../routes/paths'
import { Navigate } from 'react-router-dom'
// ----------------------------------------------------------------------

GuestGuard.propTypes = {
  children: PropTypes.node,
}

export default function GuestGuard({ children }) {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={PATH_DASHBOARD.root} />
  }

  return <>{children}</>
}
