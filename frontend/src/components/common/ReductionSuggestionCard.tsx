import { Card, Space, Typography } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { TopCategoryInfo } from '../../utils/carbonCalculator';
import { ACTIVITY_CATEGORY_LABELS, REDUCTION_SUGGESTIONS } from '../../constants/activity';
import { formatCarbon } from '../../utils/formatters';

export function ReductionSuggestionCard({ topCategory }: { topCategory: TopCategoryInfo }) {
  const label = ACTIVITY_CATEGORY_LABELS[topCategory.category];
  const suggestion = REDUCTION_SUGGESTIONS[topCategory.category];

  return (
    <Card className="suggestion-card" size="small">
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <Space align="center" size={6}>
          <BulbOutlined style={{ color: '#2f7d59', fontSize: 16 }} />
          <Typography.Text strong>减排建议</Typography.Text>
        </Space>
        <Typography.Text type="secondary">
          近30天「{label}」排放量最高（{formatCarbon(topCategory.total)}，占比 {topCategory.percent}%）
        </Typography.Text>
        <Typography.Text>{suggestion}</Typography.Text>
      </Space>
    </Card>
  );
}
