#!/bin/bash

# 自动化Git提交脚本
# 使用方法: ./auto-commit.sh "提交信息"

set -e

# 检查是否提供了提交信息
if [ -z "$1" ]; then
    echo "❌ 请提供提交信息"
    echo "使用方法: ./auto-commit.sh \"提交信息\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo "🔄 开始自动化Git流程..."

# 检查Git状态
echo "📋 检查Git状态..."
git status

# 添加所有更改
echo "➕ 添加所有更改..."
git add .

# 检查是否有更改需要提交
if git diff --cached --quiet; then
    echo "ℹ️  没有更改需要提交"
    exit 0
fi

# 提交更改
echo "💾 提交更改..."
git commit -m "$COMMIT_MESSAGE"

# post-commit钩子会自动推送到远程仓库
echo "✅ 自动化流程完成！"
echo "📝 提交信息: $COMMIT_MESSAGE"
echo "🌐 已自动推送到远程仓库"