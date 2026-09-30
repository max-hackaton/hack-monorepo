# frozen_string_literal: true

require_relative "contractor_catalog"

ContractorCatalogSeeds.call(House.where(max_chat_id: House::DEMO_CHAT_IDS).to_a)
