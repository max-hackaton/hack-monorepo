# frozen_string_literal: true

require_relative "seeds/contractor_catalog"
require_relative "seeds/showcase"
require_relative "seeds/legacy_showcase"

load(Rails.root.join("db/seeds/case_types.rb"))
LegacyShowcaseSeeds.migrate
ShowcaseSeeds.run
