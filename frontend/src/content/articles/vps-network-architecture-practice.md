---
title: 零成本搭建轻量级 VPS 网络与 CI/CD 自动化部署架构
description: 记录一次真实的云端 VPS 基础网络配置、Nginx 静态服务搭建与 GitHub Actions 自动部署上线全过程。
pubDate: 2026-09-10
channel: ai
category: cases
tags:
  - VPS
  - Nginx
  - GitHub Actions
  - CI/CD
type: article
featured: true
pinned: false
---

## 背景

在个人项目落地过程中，拥有一个稳定、安全且具备自动化部署能力的网络节点是基础设施的第一步。本文记录了基于美国节点 VPS 搭建轻量级 Nginx 静态站点，并接入 GitHub Actions 实现无感持续集成的完整实战过程。

## 基础设施配置

### 1. 安全隔离与自定义端口
为了保障基础节点的通信安全与服务隔离，系统采用自定义 SSH 端口策略：
- **服务隔离**：将控制台连接服务迁移至非标准端口 `5522`，有效削弱了公网爆破攻击。
- **防火墙放行**：通过 `ufw` 放行基础 Web 端口与控制端口，确保外部 HTTP 流量与控制流互不干扰。

```bash
# 允许 HTTP 与自定义控制端口
ufw allow 80/tcp
ufw allow 5522/tcp