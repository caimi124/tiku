"use client";

import { useState, useEffect } from "react";

/**
 * 调试版本的历年真题页面
 * 显示所有内部状态和数据流
 */
export default function HistoryDebugPage() {
  const [yearData, setYearData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addLog('🚀 组件挂载，开始获取数据...');
    fetchYearData();
  }, []);

  const fetchYearData = async () => {
    try {
      setLoading(true);
      addLog('📡 发起API请求...');
      
      const url = '/api/history-stats?exam=pharmacist';
      addLog(`📍 请求URL: ${url}`);
      
      const response = await fetch(url);
      addLog(`📊 响应状态: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      addLog(`✅ 收到响应数据`);
      addLog(`📦 success: ${result.success}`);
      addLog(`📦 data length: ${result.data?.length || 0}`);
      
      setApiResponse(result);
      
      if (!result.success) {
        throw new Error('API返回success=false');
      }
      
      if (!result.data || result.data.length === 0) {
        addLog('⚠️ 警告：API返回空数据数组');
        setYearData([]);
        return;
      }
      
      // 添加客户端数据
      const enhancedData = result.data.map((year: any) => ({
        ...year,
        completedQuestions: 0,
        correctRate: 0,
      }));
      
      addLog(`✅ 数据处理完成，共${enhancedData.length}个年份`);
      enhancedData.forEach((year: any, index: number) => {
        addLog(`   ${index + 1}. ${year.year}年 - ${year.totalQuestions}题 - ${year.subjects?.length}个科目`);
      });
      
      setYearData(enhancedData);
      addLog('✅ 数据已设置到state');
      
    } catch (err: any) {
      const errorMsg = err.message || '未知错误';
      addLog(`❌ 错误: ${errorMsg}`);
      setError(errorMsg);
      setYearData([]);
    } finally {
      setLoading(false);
      addLog(`🏁 加载完成，loading设置为false`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 标题 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 历年真题页面 - 调试模式
          </h1>
          <p className="text-gray-600">
            这个页面会显示所有内部状态和数据流，帮助定位问题
          </p>
        </div>

        {/* 状态面板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-bold mb-2">Loading状态</h3>
            <div className={`text-4xl font-bold ${loading ? 'text-yellow-500' : 'text-green-500'}`}>
              {loading ? '⏳ true' : '✅ false'}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-bold mb-2">YearData长度</h3>
            <div className={`text-4xl font-bold ${yearData.length === 0 ? 'text-red-500' : 'text-green-500'}`}>
              {yearData.length}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {yearData.length === 0 ? '❌ 空数组' : `✅ ${yearData.length}个年份`}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-bold mb-2">错误状态</h3>
            <div className={`text-4xl font-bold ${error ? 'text-red-500' : 'text-green-500'}`}>
              {error ? '❌' : '✅'}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {error || '无错误'}
            </p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-xl font-bold mb-4">📊 统计数据</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">真题总数</div>
              <div className="text-3xl font-bold text-blue-500">
                {yearData.reduce((sum, year) => sum + year.totalQuestions, 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">可用年份</div>
              <div className="text-3xl font-bold text-orange-500">
                {yearData.filter(y => y.totalQuestions > 0).length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">科目总数</div>
              <div className="text-3xl font-bold text-green-500">
                {yearData.reduce((sum, year) => sum + (year.subjects?.length || 0), 0)}
              </div>
            </div>
          </div>
        </div>

        {/* 条件渲染测试 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-xl font-bold mb-4">🧪 条件渲染测试</h3>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={`w-4 h-4 rounded-full ${loading ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
              <span>loading === true</span>
              <span className="text-gray-500">(应该显示"加载中...")</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`w-4 h-4 rounded-full ${!loading && yearData.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              <span>!loading && yearData.length &gt; 0</span>
              <span className="text-gray-500">(应该显示年份列表)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`w-4 h-4 rounded-full ${!loading && yearData.length === 0 ? 'bg-red-500' : 'bg-gray-300'}`}></span>
              <span>!loading && yearData.length === 0</span>
              <span className="text-gray-500">(应该显示"暂无数据")</span>
            </div>
          </div>
        </div>

        {/* 年份数据详情 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-xl font-bold mb-4">📚 年份数据详情</h3>
          
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
              <p className="text-gray-600 mt-4">正在加载...</p>
            </div>
          )}
          
          {!loading && yearData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-red-500 text-lg">❌ yearData 是空数组！</p>
              <p className="text-gray-600 mt-2">API返回了数据但没有设置到state</p>
            </div>
          )}
          
          {!loading && yearData.length > 0 && (
            <div className="space-y-4">
              {yearData.map((year, index) => (
                <div key={year.year} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold">
                      {year.year}年真题
                    </h4>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                      {year.totalQuestions}题
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {year.subjects?.map((subject: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span className="text-sm">{subject.name}</span>
                        <span className="text-sm text-gray-600">{subject.count}题</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API响应原始数据 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-xl font-bold mb-4">📡 API原始响应</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
            {apiResponse ? JSON.stringify(apiResponse, null, 2) : '等待API响应...'}
          </pre>
        </div>

        {/* 调试日志 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">📝 调试日志</h3>
            <button
              onClick={() => {
                setDebugLogs([]);
                fetchYearData();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              🔄 重新加载
            </button>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-y-auto max-h-96 font-mono text-sm">
            {debugLogs.length === 0 ? (
              <div className="text-gray-500">等待日志...</div>
            ) : (
              debugLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* localStorage检查 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-xl font-bold mb-4">💾 localStorage 检查</h3>
          <button
            onClick={() => {
              const cached = localStorage.getItem('history-stats-cache');
              if (cached) {
                const data = JSON.parse(cached);
                addLog(`📦 发现localStorage缓存: ${JSON.stringify(data).substring(0, 100)}...`);
                alert('发现缓存！查看调试日志');
              } else {
                addLog('✅ localStorage中没有缓存');
                alert('没有缓存');
              }
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 mr-2"
          >
            检查缓存
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              addLog('🧹 已清除所有localStorage');
              alert('缓存已清除！');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            清除缓存
          </button>
        </div>

      </div>
    </div>
  );
}
