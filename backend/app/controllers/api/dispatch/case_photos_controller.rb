# frozen_string_literal: true

module Api
  module Dispatch
    class CasePhotosController < ::Api::Dispatch::BaseController
      def show
        record = dispatch_cases.find(Integer(params[:case_id], 10, exception: false))
        photo = record
          .photos
          .includes(:blob)
          .find(Integer(params[:id], 10, exception: false))

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
