"use client";

import { useState, useEffect } from "react";

export default function TestImagesPage() {
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchTestQuestion() {
      try {
        const response = await fetch(
          `/api/questions?sourceYear=2024&subject=${encodeURIComponent('中药学专业知识（一）')}&limit=20`
        );
        const data = await response.json();
        
        console.log('📦 API响应:', data);
        
        if (data.success && data.data.questions) {
          // 找到第一个有图片的题目
          const questionWithImage = data.data.questions.find((q: any) => q.aiExplanation);
          
          console.log('🎯 找到的题目:', questionWithImage);
          
          if (questionWithImage) {
            setQuestion(questionWithImage);
            
            // 解析图片数据
            try {
              const imageData = JSON.parse(questionWithImage.aiExplanation);
              console.log('🖼️ 图片数据:', imageData);
            } catch (e) {
              console.error('解析失败:', e);
            }
          } else {
            setError('未找到包含图片的题目');
          }
        }
      } catch (err: any) {
        console.error('请求失败:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTestQuestion();
  }, []);

  if (loading) {
    return <div className="p-8">加载中...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">错误: {error}</div>;
  }

  if (!question) {
    return <div className="p-8">未找到题目</div>;
  }

  let imageData: any = null;
  try {
    imageData = JSON.parse(question.aiExplanation);
  } catch (e) {
    console.error('解析失败');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">图片显示测试页面</h1>
        
        {/* 原始数据 */}
        <div className="bg-white p-6 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-4">原始数据</h2>
          <div className="space-y-2 text-sm">
            <p><strong>题目ID:</strong> {question.id}</p>
            <p><strong>题目内容:</strong> {question.content}</p>
            <p><strong>aiExplanation:</strong></p>
            <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
              {question.aiExplanation}
            </pre>
          </div>
        </div>

        {/* 解析后的数据 */}
        {imageData && (
          <div className="bg-white p-6 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-4">解析后的图片数据</h2>
            <p className="mb-2"><strong>图片数量:</strong> {imageData.images?.length || 0}</p>
            <div className="space-y-1 text-sm">
              {imageData.images?.map((url: string, idx: number) => (
                <div key={idx} className="bg-gray-100 p-2 rounded">
                  <strong>选项 {String.fromCharCode(65 + idx)}:</strong> {url}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 图片渲染测试 */}
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">图片渲染测试</h2>
          <div className="space-y-4">
            {question.options.map((option: any, idx: number) => {
              const imgUrl = imageData?.images?.[idx];
              return (
                <div key={option.key} className="border-2 border-blue-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-lg">{option.key}.</span>
                    <div className="flex-1">
                      {/* 图片URL显示 */}
                      <div className="mb-2 text-sm text-gray-600">
                        {imgUrl ? `图片URL: ${imgUrl}` : '无图片'}
                      </div>
                      
                      {/* 图片显示 */}
                      {imgUrl && (
                        <div className="border-4 border-green-500 rounded-lg overflow-hidden bg-gray-50 p-2">
                          <img
                            src={imgUrl}
                            alt={`选项 ${option.key}`}
                            className="w-full h-auto object-contain max-h-64"
                            onLoad={() => {
                              console.log('✅ 图片加载成功:', imgUrl);
                            }}
                            onError={(e) => {
                              console.error('❌ 图片加载失败:', imgUrl);
                              console.error('错误对象:', e);
                            }}
                          />
                        </div>
                      )}
                      
                      {/* 文字 */}
                      {option.value && (
                        <div className="mt-2">{option.value}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
