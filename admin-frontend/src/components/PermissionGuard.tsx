import React, { ReactNode } from 'react'
import { usePermission } from '../contexts/PermissionContext'
import { Button, Tooltip } from 'antd'
import { LockOutlined } from '@ant-design/icons'

interface PermissionGuardProps {
  resource: string
  action: string
  children: ReactNode
  fallback?: ReactNode
  showFallback?: boolean
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action,
  children,
  fallback,
  showFallback = true
}) => {
  const { hasPermission } = usePermission()

  if (hasPermission(resource, action)) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showFallback) {
    return (
      <Tooltip title="权限不足">
        <Button 
          disabled 
          icon={<LockOutlined />}
          style={{ opacity: 0.5 }}
        >
          权限不足
        </Button>
      </Tooltip>
    )
  }

  return null
}

export default PermissionGuard