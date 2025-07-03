#!/bin/bash
###
 # @Author: gaoyang334 gaoyang334@jd.com
 # @Date: 2025-07-03 21:10:43
 # @LastEditors: gaoyang334 gaoyang334@jd.com
 # @LastEditTime: 2025-07-03 21:11:07
 # @FilePath: /light/scripts/deploy.sh
 # @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
### 

# ========== 配置区域 ==========
DEPLOY_DIR="/home/admin/application"  # 部署目录
PORT=3000                            # 服务端口
LOG_FILE="$DEPLOY_DIR/nohup.out"     # 日志文件
# =============================

# 1. 准备部署目录
echo "准备部署目录..."
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR || exit 1

# 2. 解压代码
echo "解压代码包..."
tar zxvf /home/admin/app/package.tgz -C $DEPLOY_DIR

# 3. 设置npm镜像（国内加速）
echo "设置npm镜像..."
npm config set registry https://registry.npmmirror.com

# 4. 安装依赖（包括全局 serve，用于启动生产服务器）
echo "安装依赖..."
npm install --production
npm install -g serve  # 全局安装 serve（如果没有）

# 5. 构建生产环境代码
echo "构建生产包..."
npm run build

# 6. 启动生产服务器（使用 serve 托管 build 目录）
echo "启动服务..."
# 停止旧进程（如果有）
pkill -f "serve.*$PORT" || echo "没有正在运行的 serve 进程"

# 启动新进程（-s 参数处理 SPA 路由问题）
export PORT=$PORT
nohup serve -s build -l $PORT > $LOG_FILE 2>&1 &

echo "部署完成！React 应用运行在端口 $PORT"