import type { AITaskAnalysis } from '../types';
import {
  getLocalToday,
  getCurrentTimeDisplayWithTimezone,
} from '../utils/timeUtils';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

function getSystemPrompt(): string {
  const today = getLocalToday();
  const currentTimeWithTimezone = getCurrentTimeDisplayWithTimezone();

  return `你是任务规划助手。用户输入任务描述，请：
1. 提取任务标题和背景
2. 拆解为 3-6 个可执行步骤
3. 估算每步时间（15-60分钟）
4. 判断四象限优先级（urgent-important, important, urgent, neither）
5. 解析日期和时间信息

⚠️ 重要时间信息：
- 用户当前时间：${currentTimeWithTimezone}
- 今天日期：${today}

重要：如果用户提到具体时间（如"明天9:10"、"下周三14:30"），请：
- 计算具体的日期（基于用户的本地时间，今天日期：${today}）
- 提取具体时间（24小时制，如 "09:10", "14:30"）
- 设置 suggestedDueDate 为 "YYYY-MM-DD" 格式
- 设置 suggestedStartTime 为 "HH:mm" 格式

日期计算规则（基于用户本地时间）：
- "今天" → ${today}
- "明天" → 今天日期 +1 天
- "后天" → 今天日期 +2 天
- "下周X" → 计算下一个星期X的日期
- 具体的日期描述请转换为 YYYY-MM-DD

返回 JSON：
{
  "title": "简短标题",
  "description": "任务描述",
  "priority": "urgent-important | important | urgent | neither",
  "suggestedDueDate": "YYYY-MM-DD（如果有日期信息）",
  "suggestedStartTime": "HH:mm（如果有具体时间，如 09:10）",
  "tags": ["标签1", "标签2"],
  "steps": [
    {"title": "步骤1", "description": "描述", "estimatedMinutes": 25, "order": 1}
  ],
  "totalMinutes": 120,
  "pomodoroCount": 5
}

请根据用户的本地时间来计算日期。`;
}

export async function analyzeTask(input: string): Promise<AITaskAnalysis> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error('请在 .env 文件中设置 VITE_DEEPSEEK_API_KEY');
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: input },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  // 尝试解析 JSON（可能包含代码块标记）
  let jsonContent = content.trim();
  if (jsonContent.startsWith('```json')) {
    jsonContent = jsonContent.slice(7);
  }
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.slice(3);
  }
  if (jsonContent.endsWith('```')) {
    jsonContent = jsonContent.slice(0, -3);
  }

  return JSON.parse(jsonContent.trim());
}
