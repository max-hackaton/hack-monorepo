# frozen_string_literal: true

module Demo
  class ScenarioPhotos
    class << self
      def attach(record, filenames)
        return if filenames.blank?

        record.with_lock do
          filenames.each do |filename|
            next if record.photos.blobs.any? { |blob| blob.metadata["seed_photo"] == filename }
            break if record.photos.size >= Case::MAX_PHOTOS

            Case.no_touching do
              blob = ActiveStorage::Blob.create_and_upload!(
                io: StringIO.new(File.binread(Rails.root.join("db/seeds/img", filename))),
                filename: filename,
                metadata: { seed_photo: filename },
              )
              blob.analyze
              record.photos.attach(blob)
              record.save!
            end
          end
        end
      end
    end
  end
end
