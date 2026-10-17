import { Card, Typography } from 'antd';
import { useT } from '../i18n/I18nProvider';
import type { MessageKey } from '../i18n/messages';

const { Text, Paragraph } = Typography;

/** 广告位内容（标题 + 描述），均随语言切换 */
const AD_SLOTS: { titleKey: MessageKey; descKey: MessageKey }[] = [
  { titleKey: 'right.ad1Title', descKey: 'right.ad1Desc' },
  { titleKey: 'right.ad2Title', descKey: 'right.ad2Desc' },
  { titleKey: 'right.ad3Title', descKey: 'right.ad3Desc' },
];

const RightPanel = () => {
  const t = useT();

  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      {AD_SLOTS.map((slot) => (
        <Card key={slot.titleKey} size="small" title={t('right.ad')} style={{ marginBottom: 16 }}>
          <div
            style={{
              height: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)',
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <Text strong>{t(slot.titleKey)}</Text>
            <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
              {t(slot.descKey)}
            </Paragraph>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {t('right.sponsor')}
          </Text>
        </Card>
      ))}
    </div>
  );
};

export default RightPanel;
