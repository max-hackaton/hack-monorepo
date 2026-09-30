import { Button, Container, Flex, Panel, Typography } from '@maxhub/max-ui'

export const SessionErrorPage = ({
  onRetry,
  onBack,
}: {
  onRetry: () => void
  onBack?: () => void
}) => (
  <Panel centeredX centeredY className="min-h-dvh px-(--spacing-size4xl)">
    <Container className="max-w-sm text-center">
      <Flex direction="column" align="center" gap={16}>
        <Typography.Headline variant="large-strong">
          Не удалось проверить доступ
        </Typography.Headline>
        <Typography.Body variant="medium">
          Проверьте соединение и попробуйте ещё раз.
        </Typography.Body>
        <Button variant="primary" onClick={onRetry}>
          Повторить
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
