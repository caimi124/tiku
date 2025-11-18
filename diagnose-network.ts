/**
 * 网络和数据库连接诊断工具
 */

import * as dns from 'dns'
import * as net from 'net'
import { promisify } from 'util'

const dnsLookup = promisify(dns.lookup)

const DB_HOST = 'db.tparjdkxxtnentsdazfw.supabase.co'
const DB_PORT = 5432
const API_URL = 'https://tparjdkxxtnentsdazfw.supabase.co'

async function testDNS() {
  console.log('🔍 测试 1: DNS 解析')
  try {
    const result = await dnsLookup(DB_HOST)
    console.log(`   ✓ DNS 解析成功!`)
    console.log(`   主机: ${DB_HOST}`)
    console.log(`   IP地址: ${result.address}`)
    console.log(`   地址族: ${result.family === 4 ? 'IPv4' : 'IPv6'}`)
    return true
  } catch (error) {
    console.log(`   ❌ DNS 解析失败:`, error instanceof Error ? error.message : error)
    return false
  }
}

async function testTCPConnection() {
  console.log('\n🔍 测试 2: TCP 端口连接')
  return new Promise<boolean>((resolve) => {
    const socket = new net.Socket()
    const timeout = 10000 // 10秒超时

    socket.setTimeout(timeout)

    socket.on('connect', () => {
      console.log(`   ✓ TCP 连接成功!`)
      console.log(`   端口 ${DB_PORT} 可以访问`)
      socket.destroy()
      resolve(true)
    })

    socket.on('timeout', () => {
      console.log(`   ❌ 连接超时 (${timeout}ms)`)
      socket.destroy()
      resolve(false)
    })

    socket.on('error', (error) => {
      console.log(`   ❌ TCP 连接失败:`, error.message)
      resolve(false)
    })

    console.log(`   尝试连接 ${DB_HOST}:${DB_PORT}...`)
    socket.connect(DB_PORT, DB_HOST)
  })
}

async function testHTTPSConnection() {
  console.log('\n🔍 测试 3: HTTPS API 连接')
  try {
    const response = await fetch(API_URL)
    console.log(`   ✓ HTTPS 连接成功!`)
    console.log(`   状态码: ${response.status}`)
    return true
  } catch (error) {
    console.log(`   ❌ HTTPS 连接失败:`, error instanceof Error ? error.message : error)
    return false
  }
}

async function testSupabaseAPI() {
  console.log('\n🔍 测试 4: Supabase REST API')
  try {
    const healthUrl = `${API_URL}/rest/v1/`
    const response = await fetch(healthUrl, {
      headers: {
        'apikey': 'test', // 只是测试连接，不需要真实的 key
      }
    })
    console.log(`   ✓ API 端点可访问!`)
    console.log(`   状态码: ${response.status}`)
    return true
  } catch (error) {
    console.log(`   ❌ API 访问失败:`, error instanceof Error ? error.message : error)
    return false
  }
}

async function diagnose() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🏥 Supabase 数据库连接诊断')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const dnsOk = await testDNS()
  const tcpOk = await testTCPConnection()
  const httpsOk = await testHTTPSConnection()
  const apiOk = await testSupabaseAPI()

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 诊断结果汇总')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`DNS 解析:        ${dnsOk ? '✓' : '✗'}`)
  console.log(`TCP 连接 (5432): ${tcpOk ? '✓' : '✗'}`)
  console.log(`HTTPS 连接:      ${httpsOk ? '✓' : '✗'}`)
  console.log(`API 访问:        ${apiOk ? '✓' : '✗'}`)

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('💡 建议和解决方案')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!dnsOk) {
    console.log('\n❌ DNS 解析失败:')
    console.log('   1. 检查网络连接')
    console.log('   2. 检查 DNS 服务器设置')
    console.log('   3. 尝试使用其他 DNS (如 8.8.8.8)')
  } else if (!tcpOk) {
    console.log('\n❌ TCP 连接失败（但 DNS 正常）:')
    console.log('   1. 检查防火墙是否阻止了 5432 端口')
    console.log('   2. 检查是否有 VPN 或代理干扰')
    console.log('   3. 确认 Supabase 项目处于激活状态')
    console.log('   4. 检查数据库是否暂停（免费版会自动暂停）')
    console.log('\n   📱 建议: 登录 Supabase Dashboard 检查项目状态')
    console.log('   🔗 https://supabase.com/dashboard/project/tparjdkxxtnentsdazfw')
  } else if (tcpOk && httpsOk) {
    console.log('\n✅ 网络连接正常!')
    console.log('   TCP 和 HTTPS 都可以访问，但 Prisma 连接失败可能是因为:')
    console.log('   1. 数据库密码不正确')
    console.log('   2. Prisma 连接池配置问题')
    console.log('   3. 数据库可能需要 SSL/TLS 连接')
    console.log('\n   💡 尝试在连接字符串添加 SSL 参数:')
    console.log('   DATABASE_URL="postgresql://postgres:bdcW5inRuvSMfwYN@db.tparjdkxxtnentsdazfw.supabase.co:5432/postgres?sslmode=require"')
  }

  if (httpsOk && !tcpOk) {
    console.log('\n⚠️  HTTPS 可访问但直连端口不可访问:')
    console.log('   这可能表示:')
    console.log('   1. 端口 5432 被防火墙阻止')
    console.log('   2. 需要使用连接池（Supavisor）而不是直连')
    console.log('\n   📝 Supabase 提供两种连接方式:')
    console.log('   • 直连: db.xxx.supabase.co:5432')
    console.log('   • 连接池: db.xxx.supabase.co:6543')
    console.log('\n   💡 建议: 尝试使用 6543 端口（连接池模式）')
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

diagnose().catch(console.error)
