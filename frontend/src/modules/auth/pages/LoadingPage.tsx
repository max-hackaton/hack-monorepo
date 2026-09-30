import { Container, Panel, Spinner } from '@maxhub/max-ui'

export const LoadingPage = () => (
  <Panel centeredX centeredY className="min-h-dvh px-(--spacing-size4xl)">
    <Container className="max-w-sm text-center">
      <Spinner appearance="themed" size={48} />
    </Container>
  </Panel>
)
