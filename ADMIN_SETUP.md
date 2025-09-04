# APISIX Dashboard 后台管理系统部署指南

本文档介绍如何部署和使用分离后的APISIX Dashboard后台管理系统。

## 系统架构

经过重构后，系统分为两个独立的前端界面：

1. **主前端界面** (端口80): 移除了用户管理功能的APISIX Dashboard
2. **后台管理界面** (端口8080): 独立的用户权限管理系统

## 快速开始

### 方式一：Docker Compose (推荐)

```bash
# 构建并启动所有服务
docker-compose -f docker-compose.admin.yml up -d

# 查看服务状态
docker-compose -f docker-compose.admin.yml ps

# 查看日志
docker-compose -f docker-compose.admin.yml logs -f apisix-dashboard
```

访问地址：
- 主界面: http://localhost:80
- 后台管理: http://localhost:8080
- API接口: http://localhost:9000

### 方式二：Docker 单独构建

```bash
# 构建包含后台管理的镜像
docker build -f Dockerfile.admin -t apisix-dashboard-admin .

# 运行容器
docker run -d \
  --name apisix-dashboard-admin \
  -p 80:80 \
  -p 8080:8080 \
  -p 9000:9000 \
  apisix-dashboard-admin
```

### 方式三：本地开发

#### 启动后台管理前端

```bash
cd admin-frontend
npm install
npm run dev
```

后台管理界面将在 http://localhost:3001 启动

#### 启动主前端

```bash
cd web
yarn install
yarn start
```

主界面将在 http://localhost:8000 启动

#### 启动后端API

```bash
cd api
go run main.go
```

API服务将在 http://localhost:9000 启动

## Kubernetes 部署

### 部署到K8s集群

```bash
# 应用配置
kubectl apply -f k8s-deployment.yaml

# 检查部署状态
kubectl get pods -l app=apisix-dashboard
kubectl get services
kubectl get ingress
```

### 访问服务

配置hosts文件或DNS：
```
<your-k8s-ingress-ip> apisix-dashboard.local
<your-k8s-ingress-ip> apisix-admin.local
```

访问地址：
- 主界面: http://apisix-dashboard.local
- 后台管理: http://apisix-admin.local

## Nginx 代理配置

如果需要自定义代理配置，可以修改 `nginx.conf` 文件：

```bash
# 测试nginx配置
nginx -t -c /path/to/nginx.conf

# 重新加载配置
nginx -s reload
```

## 功能说明

### 主前端界面 (端口80)
- 路由管理
- 服务管理
- 上游管理
- 插件配置
- SSL证书管理
- 消费者管理
- **已移除**: 用户管理、权限管理、审计日志

### 后台管理界面 (端口8080)
- 用户管理
  - 用户列表
  - 添加/编辑/删除用户
  - 用户状态管理
- 权限管理
  - 权限列表
  - 角色管理
  - 权限分配
- 审计日志
  - 操作日志查看
  - 日志筛选和搜索
  - 详细信息查看

## 环境变量配置

### Docker环境变量

```bash
# ETCD配置
ETCD_ENDPOINTS=http://etcd:2379

# API配置
API_HOST=0.0.0.0
API_PORT=9000

# 认证配置
JWT_SECRET=your-secret-key
JWT_EXPIRE_TIME=3600
```

### 开发环境变量

在 `admin-frontend/.env` 中配置：

```bash
VITE_API_BASE_URL=http://localhost:9000
VITE_APP_TITLE=APISIX 后台管理系统
```

## 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   lsof -i :80
   lsof -i :8080
   lsof -i :9000
   ```

2. **ETCD连接失败**
   ```bash
   # 检查ETCD状态
   docker logs apisix-etcd
   
   # 测试连接
   curl http://localhost:2379/health
   ```

3. **前端构建失败**
   ```bash
   # 清理缓存
   cd admin-frontend
   rm -rf node_modules package-lock.json
   npm install
   
   cd ../web
   rm -rf node_modules yarn.lock
   yarn install
   ```

4. **API服务启动失败**
   ```bash
   # 检查配置文件
   cat api/conf/conf.yaml
   
   # 检查Go模块
   cd api
   go mod tidy
   go mod download
   ```

### 日志查看

```bash
# Docker Compose日志
docker-compose -f docker-compose.admin.yml logs -f

# 单个服务日志
docker logs apisix-dashboard-admin

# K8s日志
kubectl logs -f deployment/apisix-dashboard
```

## 安全配置

### 生产环境建议

1. **修改默认密码**
   - 更新 `api/conf/conf.yaml` 中的用户密码
   - 使用强密码策略

2. **配置HTTPS**
   - 在Nginx中配置SSL证书
   - 强制HTTPS重定向

3. **网络安全**
   - 限制后台管理界面的访问IP
   - 配置防火墙规则
   - 使用VPN或内网访问

4. **JWT安全**
   - 使用强随机JWT密钥
   - 设置合适的过期时间
   - 定期轮换密钥

## 监控和维护

### 健康检查

```bash
# 检查服务健康状态
curl http://localhost:80/health
curl http://localhost:8080/health
curl http://localhost:9000/apisix/admin/health
```

### 备份

```bash
# 备份ETCD数据
etcdctl snapshot save backup.db

# 备份配置文件
tar -czf config-backup.tar.gz api/conf/ nginx.conf
```

### 更新

```bash
# 更新镜像
docker-compose -f docker-compose.admin.yml pull
docker-compose -f docker-compose.admin.yml up -d

# K8s滚动更新
kubectl set image deployment/apisix-dashboard apisix-dashboard=apisix-dashboard-admin:latest
```

## 开发指南

### 添加新功能

1. **后台管理前端**
   - 在 `admin-frontend/src/pages/` 添加新页面
   - 在 `admin-frontend/src/components/Sidebar.tsx` 添加菜单项
   - 在 `admin-frontend/src/App.tsx` 添加路由

2. **API接口**
   - 在 `api/internal/handler/` 添加处理器
   - 在 `api/internal/route.go` 添加路由
   - 在 `api/internal/service/` 添加业务逻辑

### 代码规范

- 前端使用TypeScript + React + Ant Design
- 后端使用Go + Gin框架
- 遵循RESTful API设计原则
- 使用ESLint和Prettier格式化代码

## 支持

如有问题，请查看：
- [APISIX Dashboard官方文档](https://apisix.apache.org/docs/dashboard/USER_GUIDE)
- [GitHub Issues](https://github.com/apache/apisix-dashboard/issues)
- 项目内的其他文档文件