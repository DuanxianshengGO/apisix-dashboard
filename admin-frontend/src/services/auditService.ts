import dayjs from 'dayjs'

export interface AuditLog {
  id: string
  userId: string
  username: string
  action: string
  resource: string
  resourceId: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  status: 'success' | 'failed'
  errorMsg?: string
  timestamp: number
  createTime: string
}

class AuditService {
  private static instance: AuditService
  private readonly STORAGE_KEY = 'auditLogs'

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService()
    }
    return AuditService.instance
  }

  // 记录审计日志
  log(params: {
    userId: string
    username: string
    action: string
    resource: string
    resourceId: string
    details?: Record<string, any>
    status: 'success' | 'failed'
    errorMsg?: string
  }): void {
    try {
      const auditLog: AuditLog = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        userId: params.userId,
        username: params.username,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details || {},
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        status: params.status,
        errorMsg: params.errorMsg,
        timestamp: Date.now(),
        createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      }

      const existingLogs = this.getLogs()
      const updatedLogs = [auditLog, ...existingLogs]
      
      // 只保留最近1000条记录
      const limitedLogs = updatedLogs.slice(0, 1000)
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limitedLogs))
    } catch (error) {
      console.error('记录审计日志失败:', error)
    }
  }

  // 获取所有审计日志
  getLogs(): AuditLog[] {
    try {
      const logs = localStorage.getItem(this.STORAGE_KEY)
      return logs ? JSON.parse(logs) : []
    } catch (error) {
      console.error('获取审计日志失败:', error)
      return []
    }
  }

  // 获取今日审计日志数量
  getTodayLogsCount(): number {
    const logs = this.getLogs()
    const today = dayjs().startOf('day')
    return logs.filter(log => dayjs(log.timestamp).isAfter(today)).length
  }

  // 清空审计日志
  clearLogs(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // 获取客户端IP（模拟）
  private getClientIP(): string {
    // 在实际应用中，这应该从服务器端获取
    return '192.168.1.' + Math.floor(Math.random() * 255)
  }

  // 记录登录日志
  logLogin(username: string, userId: string, success: boolean, errorMsg?: string): void {
    this.log({
      userId,
      username,
      action: 'login',
      resource: 'system',
      resourceId: 'auth',
      details: { loginMethod: 'password' },
      status: success ? 'success' : 'failed',
      errorMsg
    })
  }

  // 记录登出日志
  logLogout(username: string, userId: string): void {
    this.log({
      userId,
      username,
      action: 'logout',
      resource: 'system',
      resourceId: 'auth',
      details: {},
      status: 'success'
    })
  }

  // 记录权限操作日志
  logPermissionOperation(username: string, userId: string, action: string, resourceType: string, resourceId: string, details?: Record<string, any>, success: boolean = true, errorMsg?: string): void {
    this.log({
      userId,
      username,
      action,
      resource: resourceType,
      resourceId,
      details: details || {},
      status: success ? 'success' : 'failed',
      errorMsg
    })
  }
}

export default AuditService.getInstance()