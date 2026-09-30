# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_28_222657) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "billing_routes", force: :cascade do |t|
    t.string "adapter", null: false
    t.bigint "case_type_id", null: false
    t.datetime "created_at", null: false
    t.bigint "house_id", null: false
    t.datetime "updated_at", null: false
    t.index ["case_type_id"], name: "index_billing_routes_on_case_type_id"
    t.index ["house_id", "case_type_id"], name: "index_billing_routes_on_house_id_and_case_type_id", unique: true
    t.index ["house_id"], name: "index_billing_routes_on_house_id"
    t.check_constraint "adapter::text = ANY (ARRAY['uk'::character varying::text, 'rko'::character varying::text])", name: "billing_routes_adapter_valid"
  end

  create_table "case_confirmations", force: :cascade do |t|
    t.bigint "case_id", null: false
    t.datetime "confirmed_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["case_id", "user_id"], name: "index_case_confirmations_on_case_id_and_user_id", unique: true
    t.index ["case_id"], name: "index_case_confirmations_on_case_id"
    t.index ["user_id"], name: "index_case_confirmations_on_user_id"
  end

  create_table "case_events", force: :cascade do |t|
    t.bigint "actor_user_id"
    t.bigint "case_id", null: false
    t.datetime "created_at", null: false
    t.jsonb "data", default: {}, null: false
    t.string "event_type", null: false
    t.datetime "occurred_at", null: false
    t.datetime "updated_at", null: false
    t.index ["actor_user_id"], name: "index_case_events_on_actor_user_id"
    t.index ["case_id", "occurred_at"], name: "index_case_events_on_case_id_and_occurred_at"
    t.index ["case_id"], name: "index_case_events_on_case_id"
  end

  create_table "case_types", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "description"
    t.string "key", null: false
    t.string "name", null: false
    t.integer "sort_order", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_case_types_on_key", unique: true
  end

  create_table "cases", force: :cascade do |t|
    t.bigint "case_type_id", null: false
    t.integer "classification_version", default: 0, null: false
    t.datetime "classified_at"
    t.bigint "classified_by_id"
    t.bigint "contractor_id"
    t.datetime "created_at", null: false
    t.bigint "creator_id", null: false
    t.bigint "current_step_id", null: false
    t.text "description", null: false
    t.bigint "house_id", null: false
    t.boolean "is_emergency", default: false, null: false
    t.string "location_details"
    t.bigint "management_company_id"
    t.string "original_case_type_key"
    t.string "original_problem_key"
    t.string "problem_key"
    t.string "return_reason"
    t.datetime "updated_at", null: false
    t.datetime "violation_ended_at"
    t.datetime "violation_started_at"
    t.string "visibility", null: false
    t.integer "workflow_version", default: 0, null: false
    t.index ["case_type_id"], name: "index_cases_on_case_type_id"
    t.index ["classified_by_id"], name: "index_cases_on_classified_by_id"
    t.index ["contractor_id"], name: "index_cases_on_contractor_id"
    t.index ["creator_id"], name: "index_cases_on_creator_id"
    t.index ["current_step_id"], name: "index_cases_on_current_step_id"
    t.index ["house_id", "visibility", "id"], name: "index_cases_on_house_id_and_visibility_and_id"
    t.index ["house_id"], name: "index_cases_on_house_id"
    t.index ["management_company_id"], name: "index_cases_on_management_company_id"
    t.check_constraint "classification_version >= 0", name: "cases_classification_version_valid"
    t.check_constraint "classified_at IS NULL AND classified_by_id IS NULL OR classified_at IS NOT NULL AND classified_by_id IS NOT NULL AND problem_key IS NOT NULL", name: "cases_classification_complete"
    t.check_constraint "contractor_id IS NULL OR classified_at IS NOT NULL AND management_company_id IS NOT NULL", name: "cases_assignment_classified"
    t.check_constraint "return_reason::text = ANY (ARRAY['repair_not_resolved'::character varying::text, 'recalculation_missing'::character varying::text, 'billing_failed'::character varying::text])", name: "cases_return_reason_valid"
    t.check_constraint "visibility::text = ANY (ARRAY['public'::character varying::text, 'private'::character varying::text])", name: "cases_visibility_valid"
    t.check_constraint "workflow_version >= 0", name: "cases_workflow_version_valid"
  end

  create_table "contractor_routings", force: :cascade do |t|
    t.bigint "case_type_id", null: false
    t.bigint "contractor_id", null: false
    t.datetime "created_at", null: false
    t.bigint "house_id"
    t.bigint "management_company_id", null: false
    t.string "problem_key", null: false
    t.datetime "updated_at", null: false
    t.index ["case_type_id"], name: "index_contractor_routings_on_case_type_id"
    t.index ["contractor_id", "case_type_id", "problem_key", "house_id"], name: "index_contractor_routings_house_unique", unique: true, where: "(house_id IS NOT NULL)"
    t.index ["contractor_id", "case_type_id", "problem_key"], name: "index_contractor_routings_company_unique", unique: true, where: "(house_id IS NULL)"
    t.index ["contractor_id"], name: "index_contractor_routings_on_contractor_id"
    t.index ["house_id"], name: "index_contractor_routings_on_house_id"
    t.index ["management_company_id", "case_type_id", "problem_key", "house_id"], name: "index_contractor_routings_lookup"
    t.index ["management_company_id"], name: "index_contractor_routings_on_management_company_id"
    t.check_constraint "btrim(problem_key::text) <> ''::text", name: "contractor_routings_problem_present"
  end

  create_table "contractors", force: :cascade do |t|
    t.boolean "archived", default: false, null: false
    t.datetime "created_at", null: false
    t.bigint "management_company_id", null: false
    t.string "max_url"
    t.string "name", null: false
    t.string "phone", null: false
    t.datetime "updated_at", null: false
    t.index ["id", "management_company_id"], name: "index_contractors_on_id_and_management_company_id", unique: true
    t.index ["management_company_id"], name: "index_contractors_on_management_company_id"
    t.check_constraint "btrim(name::text) <> ''::text AND btrim(phone::text) <> ''::text", name: "contractors_contact_present"
  end

  create_table "dispatch_house_selections", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "house_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["house_id"], name: "index_dispatch_house_selections_on_house_id"
    t.index ["user_id", "house_id"], name: "index_dispatch_house_selections_on_user_id_and_house_id", unique: true
  end

  create_table "houses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "full_address", null: false
    t.bigint "management_company_id"
    t.string "max_chat_id", null: false
    t.datetime "updated_at", null: false
    t.index ["id", "management_company_id"], name: "index_houses_on_id_and_management_company_id", unique: true
    t.index ["management_company_id"], name: "index_houses_on_management_company_id"
    t.index ["max_chat_id"], name: "index_houses_on_max_chat_id", unique: true
  end

  create_table "legal_chunks", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.string "embedding_model"
    t.bigint "legal_document_id", null: false
    t.integer "position"
    t.datetime "updated_at", null: false
    t.index ["legal_document_id"], name: "index_legal_chunks_on_legal_document_id"
  end

  create_table "legal_documents", force: :cascade do |t|
    t.boolean "active"
    t.text "content"
    t.string "content_digest"
    t.datetime "created_at", null: false
    t.string "document_type"
    t.datetime "indexed_at"
    t.string "indexed_digest"
    t.string "reference"
    t.string "source_key"
    t.string "source_url"
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "management_companies", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "inn"
    t.string "name", null: false
    t.string "ogrn"
    t.datetime "updated_at", null: false
    t.index ["inn"], name: "index_management_companies_on_inn", unique: true
    t.index ["ogrn"], name: "index_management_companies_on_ogrn", unique: true
  end

  create_table "management_company_memberships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "management_company_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["management_company_id"], name: "index_management_company_memberships_on_management_company_id"
    t.index ["user_id", "management_company_id"], name: "idx_on_user_id_management_company_id_0704d66994", unique: true
    t.index ["user_id"], name: "index_management_company_memberships_on_user_id"
  end

  create_table "recalculation_requests", force: :cascade do |t|
    t.string "adapter", null: false
    t.bigint "billing_route_id", null: false
    t.bigint "case_id", null: false
    t.datetime "created_at", null: false
    t.string "external_id"
    t.jsonb "payload", null: false
    t.string "status", default: "pending", null: false
    t.datetime "submitted_at"
    t.text "transmission_error"
    t.datetime "updated_at", null: false
    t.index ["billing_route_id"], name: "index_recalculation_requests_on_billing_route_id"
    t.index ["case_id"], name: "index_recalculation_requests_on_case_id"
    t.index ["case_id"], name: "one_pending_recalculation_per_case", unique: true, where: "((status)::text = 'pending'::text)"
    t.check_constraint "jsonb_typeof(payload) = 'object'::text", name: "recalculation_requests_payload_object"
    t.check_constraint "status::text <> 'failed'::text OR transmission_error IS NOT NULL", name: "recalculation_requests_failure_present"
    t.check_constraint "status::text <> 'submitted'::text OR external_id IS NOT NULL AND submitted_at IS NOT NULL", name: "recalculation_requests_receipt_present"
    t.check_constraint "status::text = ANY (ARRAY['pending'::character varying::text, 'submitted'::character varying::text, 'failed'::character varying::text])", name: "recalculation_requests_status_valid"
  end

  create_table "sessions", force: :cascade do |t|
    t.string "active_role"
    t.datetime "created_at", null: false
    t.datetime "expires_at", null: false
    t.bigint "house_id"
    t.string "token_digest", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["expires_at"], name: "index_sessions_on_expires_at"
    t.index ["house_id"], name: "index_sessions_on_house_id"
    t.index ["token_digest"], name: "index_sessions_on_token_digest", unique: true
    t.index ["user_id"], name: "index_sessions_on_user_id"
    t.check_constraint "active_role::text = ANY (ARRAY['resident'::character varying::text, 'dispatcher'::character varying::text])", name: "sessions_active_role_valid"
  end

  create_table "steps", force: :cascade do |t|
    t.bigint "case_type_id", null: false
    t.datetime "created_at", null: false
    t.string "description"
    t.string "key", null: false
    t.string "kind", null: false
    t.integer "sort_order", null: false
    t.string "status_key", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["case_type_id", "key"], name: "index_steps_on_case_type_id_and_key", unique: true
    t.index ["case_type_id", "sort_order"], name: "index_steps_on_case_type_id_and_sort_order", unique: true
    t.index ["case_type_id"], name: "index_steps_on_case_type_id"
    t.index ["id", "case_type_id"], name: "index_steps_on_id_and_case_type_id", unique: true
    t.check_constraint "status_key::text = ANY (ARRAY['new'::character varying::text, 'in_progress'::character varying::text, 'action_required'::character varying::text, 'closed_by_executor'::character varying::text, 'completed'::character varying::text, 'awaiting_recalculation'::character varying::text])", name: "steps_status_key_valid"
  end

  create_table "user_houses", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "house_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.datetime "verified_at"
    t.index ["house_id"], name: "index_user_houses_on_house_id"
    t.index ["user_id", "house_id"], name: "index_user_houses_on_user_id_and_house_id", unique: true
    t.index ["user_id"], name: "index_user_houses_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "first_name"
    t.string "last_name"
    t.string "max_user_id", null: false
    t.string "photo_url"
    t.datetime "updated_at", null: false
    t.index ["max_user_id"], name: "index_users_on_max_user_id", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "billing_routes", "case_types"
  add_foreign_key "billing_routes", "houses"
  add_foreign_key "case_confirmations", "cases"
  add_foreign_key "case_confirmations", "users"
  add_foreign_key "case_events", "cases"
  add_foreign_key "case_events", "users", column: "actor_user_id"
  add_foreign_key "cases", "case_types"
  add_foreign_key "cases", "contractors"
  add_foreign_key "cases", "contractors", column: ["contractor_id", "management_company_id"], primary_key: ["id", "management_company_id"]
  add_foreign_key "cases", "houses"
  add_foreign_key "cases", "management_companies"
  add_foreign_key "cases", "steps", column: ["current_step_id", "case_type_id"], primary_key: ["id", "case_type_id"], name: "fk_cases_current_step_case_type"
  add_foreign_key "cases", "users", column: "classified_by_id"
  add_foreign_key "cases", "users", column: "creator_id"
  add_foreign_key "contractor_routings", "case_types"
  add_foreign_key "contractor_routings", "contractors"
  add_foreign_key "contractor_routings", "contractors", column: ["contractor_id", "management_company_id"], primary_key: ["id", "management_company_id"]
  add_foreign_key "contractor_routings", "houses"
  add_foreign_key "contractor_routings", "houses", column: ["house_id", "management_company_id"], primary_key: ["id", "management_company_id"]
  add_foreign_key "contractor_routings", "management_companies"
  add_foreign_key "contractors", "management_companies"
  add_foreign_key "dispatch_house_selections", "houses", on_delete: :cascade
  add_foreign_key "dispatch_house_selections", "users", on_delete: :cascade
  add_foreign_key "houses", "management_companies"
  add_foreign_key "legal_chunks", "legal_documents"
  add_foreign_key "management_company_memberships", "management_companies"
  add_foreign_key "management_company_memberships", "users"
  add_foreign_key "recalculation_requests", "billing_routes"
  add_foreign_key "recalculation_requests", "cases"
  add_foreign_key "sessions", "houses"
  add_foreign_key "sessions", "users"
  add_foreign_key "steps", "case_types"
  add_foreign_key "user_houses", "houses"
  add_foreign_key "user_houses", "users"
end
