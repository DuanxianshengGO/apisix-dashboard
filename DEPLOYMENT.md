# APISIX Dashboard K8s 部署指南

## 概述

本项目已集成独立的后台管理前端系统，支持通过 Kubernetes 部署完整的 APISIX Dashboard 解决方案。

## 架构说明

### 服务端口
- **80**: 主前端界面 (原 APISIX Dashboard)
- **8080**: 后台管理界面 (新增的 Admin Frontend)
- **9000**: API 服务端口

### 组件说明
- **主前端**: 基于原有的 APISIX Dashboard Web 界面
- **后台管理前端**: 基于 React + TypeScript + Ant Design 的独立管理界面
- **API 服务**: Go 语言编写的后端 API 服务
- **Nginx**: 反向代理和静态文件服务
- **Supervisor**: 进程管理，同时运行 Nginx 和 API 服务

## 部署步骤

### 1. 构建 Docker 镜像

```bash
# 使用 K8s 优化的 Dockerfile 构建镜像
docker build -f Dockerfile.k8s -t apisix-dashboard:latest .
```

### 2. 部署到 Kubernetes

```bash
# 应用 K8s 配置
kubectl apply -f k8s-deployment.yaml
```

### 3. 配置访问

部署完成后，可以通过以下方式访问：

#### 通过 Ingress (推荐)
- 主界面: `http://apisix-dashboard.local`
- 后台管理: `http://apisix-admin.local`

#### 通过端口转发
```bash
# 转发主界面
kubectl port-forward service/apisix-dashboard-service 8000:80

# 转发后台管理界面
kubectl port-forward service/apisix-dashboard-service 8080:8080

# 转发 API 服务
kubectl port-forward service/apisix-dashboard-service 9000:9000
```

## 默认登录信息

- **用户名**: admin
- **密码**: Goodwe!apisix123

> 注意：生产环境中请修改 ConfigMap 中的默认密码

## 功能特性

### 后台管理界面 (端口 8080)
- ✅ JWT 认证和授权
- ✅ 用户权限管理
- ✅ 审计日志查看
- ✅ 系统配置管理
- ✅ 响应式设计
- ✅ 现代化 UI 组件

### 技术栈
- **前端**: React 18 + TypeScript + Ant Design + Vite
- **后端**: Go + Gin + JWT
- **容器**: Docker + Nginx + Supervisor
- **编排**: Kubernetes

## 配置说明

### ConfigMap 配置

主要配置项在 `k8s-deployment.yaml` 的 ConfigMap 中：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: apisix-dashboard-config
data:
  conf.yaml: |
    conf:
      listen:
        host: 0.0.0.0
        port: 9000
      authentication:
        users:
          - username: admin
            password: Goodwe!apisix123
```

### 自定义配置

1. 修改 ConfigMap 中的配置
2. 重新应用配置：`kubectl apply -f k8s-deployment.yaml`
3. 重启 Pod：`kubectl rollout restart deployment/apisix-dashboard`

## 监控和日志

### 健康检查
- 主界面健康检查: `http://pod-ip:80/health`
- 后台管理健康检查: `http://pod-ip:8080/health`

### 日志查看
```bash
# 查看 Pod 日志
kubectl logs -f deployment/apisix-dashboard

# 查看特定容器日志
kubectl logs -f deployment/apisix-dashboard -c apisix-dashboard
```

## 故障排除

### 常见问题

1. **Pod 启动失败**
   - 检查镜像是否正确构建
   - 查看 Pod 事件：`kubectl describe pod <pod-name>`

2. **无法访问界面**
   - 检查 Service 和 Ingress 配置
   - 确认端口转发设置正确

3. **认证失败**
   - 检查 ConfigMap 中的用户配置
   - 确认密码是否正确

4. **登录接口返回404错误**
   - 确保使用正确的API路径：`/api/apisix/admin/user/login`
   - 检查nginx代理配置是否包含路径重写规则
   - 验证manager-api服务是否正常运行在容器内的9000端口

### 调试命令

```bash
# 查看 Pod 状态
kubectl get pods -l app=apisix-dashboard

# 查看服务状态
kubectl get svc apisix-dashboard-service

# 查看 Ingress 状态
kubectl get ingress

# 进入 Pod 调试
kubectl exec -it deployment/apisix-dashboard -- /bin/sh
```

## 安全建议

1. **修改默认密码**: 在生产环境中务必修改默认的管理员密码
2. **启用 HTTPS**: 配置 TLS 证书用于生产环境
3. **网络策略**: 配置 Kubernetes NetworkPolicy 限制网络访问
4. **资源限制**: 根据实际需求调整 CPU 和内存限制

## 更新和维护

### 更新镜像
```bash
# 构建新镜像
docker build -f Dockerfile.k8s -t apisix-dashboard:v2.0 .

# 更新部署
kubectl set image deployment/apisix-dashboard apisix-dashboard=apisix-dashboard:v2.0
```

### 备份配置
```bash
# 导出当前配置
kubectl get configmap apisix-dashboard-config -o yaml > backup-config.yaml
```

---

如有问题，请查看项目文档或提交 Issue。