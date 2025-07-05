#!/bin/bash

# ========== 配置 ==========
DEPLOY_DIR="/home/admin/application"  # 部署目录
PORT=5000                            # 端口
LOG_FILE="$DEPLOY_DIR/nohup.out"     # 日志文件
# =========================

# 1. 进入部署目录
mkdir -p $DEPLOY_DIR && cd $DEPLOY_DIR || exit 1

# 2. 解压代码（假设云效上传了 package.tgz）
tar zxvf /home/admin/app/package.tgz -C $DEPLOY_DIR || exit 1

# 3. 安装依赖并构建生产包
npm install --production --no-optional || exit 1
npm run build || exit 1  # 生成 build/ 目录

# 4. 安装 serve（如果没有）
if ! command -v serve &> /dev/null; then
  npm install -g serve || exit 1
fi

# 5. 停止旧进程（根据端口）
fuser -k $PORT/tcp > /dev/null 2>&1 || true
sleep 2

# 6. 启动服务
nohup serve -s build -l $PORT > $LOG_FILE 2>&1 &
echo "React 应用已启动在端口 $PORT"