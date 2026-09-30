import { Button, CellList, CellSimple, Container, Panel } from '@maxhub/max-ui'
import { Link } from '@tanstack/react-router'

export const NoHouseAccessPage = () => (
  <Panel
    mode="secondary"
    centeredX
    centeredY
    className="min-h-dvh px-(--spacing-size4xl)"
  >
    <Container className="w-full max-w-sm">
      <CellList mode="island">
        <CellSimple
          title="Нет доступа к дому"
          subtitle="Откройте приложение из привязанного чата дома в MAX."
        />
        <div className="px-(--spacing-size2xl) pb-(--spacing-size2xl)">
          <Button stretched variant="primary" role="link" asChild>
            <Link to="/profile">Выбрать дом</Link>
          </Button>
        </div>
      </CellList>
    </Container>
  </Panel>
)
