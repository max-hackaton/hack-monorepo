import { Button, Container, Flex, Panel, Typography } from '@maxhub/max-ui'

const maxAppUrl = 'https://max.ru/t482_hakaton_max_bot'

export const OpenInMaxPage = ({ onBack }: { onBack?: () => void }) => (
  <Panel centeredX centeredY className="min-h-dvh px-(--spacing-size4xl)">
    <Container className="max-w-sm text-center">
      <Flex direction="column" align="center" gap={16}>
        <Typography.Headline variant="large-strong">
          Откройте в MAX
        </Typography.Headline>
        <Typography.Body variant="medium">
          Войдите в мини-приложение через MAX, чтобы увидеть свои заявки.
        </Typography.Body>
        <Button asChild variant="primary">
          <a href={maxAppUrl}>Открыть в MAX</a>
        </Button>
        {onBack && (
          <Button variant="secondary" onClick={onBack}>
            К выбору роли
          </Button>
        )}
      </Flex>
    </Container>
  </Panel>
)
