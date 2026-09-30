# frozen_string_literal: true

module Api
  module Resident
    class CasePhotosController < ::Api::BaseController
      before_action :require_house_access

      def show
        record = current_house
          .cases
          .visible_to(current_user)
          .find(params[:case_id])
        photo = record
          .photos
          .includes(:blob)
          .find(params[:id])

        send_data(
          photo.download,
          filename: photo.filename.to_s,
          type: photo.content_type,
          disposition: "inline",
        )
      end
    end
  end
end
