# frozen_string_literal: true

Rails.application.routes.draw do
  post "/max/webhook", to: "max/webhooks#create"

  if Rails.env.development? || Rails.env.test?
    mount Rswag::Ui::Engine => "/docs"
    mount Rswag::Api::Engine => "/docs",
      constraints: ->(request) { request.path == "/docs/openapi.yaml" }
  end

  namespace :api do
    namespace :dispatch do
      resources :houses, only: :index
      resource :house_selection, path: "house-selection", only: [:show, :update]
      resources :case_types, path: "case-types", param: :key, only: [:index, :show]
      resources :companies, only: :index do
        resources :contractors, only: [:index, :create, :update]
        resources :contractor_routings, path: "contractor-routings", only: [:index, :create, :destroy]
      end
      resources :cases, only: [:index, :show] do
        resource :classification, only: :update, controller: :case_classifications
        resource :assignment, only: :update, controller: :case_assignments
        resources :photos, only: :show, controller: :case_photos
        resources :events, only: :index, controller: :case_events
        resources :messages, only: :create, controller: :case_messages
        resource :status, only: :update, controller: :case_statuses
        resources :actions, only: :create, controller: :case_actions
        resource :action_form, path: "action-form", only: :show, controller: :case_action_forms
      end
    end

    scope module: :resident do
      resources :houses, only: :index
      resource :home, only: :show
      resources :case_types, path: "case-types", param: :key, only: [:index, :show]
      resources :cases, only: [:index, :create, :show] do
        resource :confirmations, only: :create, controller: :confirmations
        resources :photos, only: :show, controller: :case_photos
        resources :events, only: :index, controller: :case_events
        resources :messages, only: :create, controller: :case_messages
        resource :status, only: :update, controller: :case_statuses
        resources :actions, only: :create, controller: :case_actions
        resource :action_form, path: "action-form", only: :show, controller: :case_action_forms
      end
    end
    namespace :auth do
      resource :session, only: [:create, :show, :update, :destroy]
      put "session/house", to: "session_houses#update"
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
