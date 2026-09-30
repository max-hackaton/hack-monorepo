# frozen_string_literal: true

class CaseActivityQuery
  ACTIVITY_SQL = "GREATEST(COALESCE(last_events.last_event_at, cases.created_at), cases.updated_at)"

  def initialize(scope = Case.all)
    @scope = scope
  end

  def call
    scope = @scope.joins(<<~SQL)
      LEFT JOIN LATERAL (
        SELECT MAX(occurred_at) AS last_event_at
        FROM case_events WHERE case_id = cases.id
      ) last_events ON TRUE
    SQL
    scope.select("cases.*", "#{ACTIVITY_SQL} AS last_activity_at")
  end
end
