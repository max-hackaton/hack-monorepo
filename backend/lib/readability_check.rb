# frozen_string_literal: true

require "prism"

class ReadabilityCheck
  MAX_LINES = 199
  METHOD_WARNING_LINES = 40

  attr_reader :errors, :warnings

  def initialize(path, source = File.read(path))
    @path = path
    @source = source
    @errors = []
    @warnings = []
  end

  def call
    lines = @source.lines.count
    if lines > MAX_LINES
      error(1, "#{lines} physical lines; limit is #{MAX_LINES}")
    end

    parsed = Prism.parse(@source)
    parsed.errors.each do |failure|
      error(failure.location.start_line, failure.message)
    end
    inspect_node(parsed.value)
    self
  end

  private

  def inspect_node(node)
    if node.is_a?(Prism::DefNode)
      lines = node.location.end_line - node.location.start_line + 1
      if lines > METHOD_WARNING_LINES
        @warnings << "#{@path}:#{node.location.start_line}: #{node.name} spans #{lines} lines; " \
          "consider splitting by responsibility"
      end
    end
    node.compact_child_nodes.each do |child|
      inspect_node(child)
    end
  end

  def error(line, message)
    @errors << "#{@path}:#{line}: #{message}"
  end
end
