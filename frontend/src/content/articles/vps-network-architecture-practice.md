---
title: VPS 网络架构实战：从域名解析到安全部署
description: 记录个人网站部署过程中 DNS、HTTPS、SSH、自动化发布与主机密钥校验的完整实践。
pubDate: 2026-09-10
channel: ai
category: cases
tags:
  - VPS
  - 网络架构
  - GitHub Actions
  - 自动化部署
type: article
featured: false
pinned: false
---

## 为什么要搭建这套网络架构

这里写你的背景和目标，例如：为个人网站建立稳定、安全、可自动部署的生产环境。

## 整体架构

- 域名：`keke-v2.com` 与 `www.keke-v2.com`
- 服务器：美国 VPS
- 静态站点：Astro
- 自动化部署：GitHub Actions
- 传输方式：SSH + rsync
- SSH 端口：5522

## DNS 与 HTTPS 配置

写域名解析、证书、主域名与 www 域名跳转的处理。

## GitHub Actions 自动部署

写从 Git 提交、前端构建、测试、SSH 连接，到同步静态文件和原子切换的流程。

## SSH 安全配置与踩坑

写主机密钥校验、`SERVER_KNOWN_HOSTS`、密钥权限和本次排查过程。

## 最终复盘

- 已解决的问题：
- 仍需优化的部分：
- 下次部署的检查清单：