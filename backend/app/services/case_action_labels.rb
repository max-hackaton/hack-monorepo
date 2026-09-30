# frozen_string_literal: true

class CaseActionLabels
  LABELS = {
    "start_work" => "Взять в работу",
    "request_clarification" => "Запросить уточнение",
    "answer_clarification" => "Отправить ответ",
    "finish_work" => "Завершить работы",
    "confirm_repair" => "Проблема решена",
    "reject_repair" => "Проблема не решена",
    "confirm_recalculation" => "Перерасчёт отражён",
    "reject_recalculation" => "Перерасчёта нет",
    "retry_recalculation" => "Повторить передачу на перерасчёт",
    "resume_recalculation" => "Возобновить передачу",
  }.freeze

  class << self
    def fetch(action)
      LABELS.fetch(action.to_s)
    end
  end
end
