# frozen_string_literal: true

require "openssl"
require "uri"

module Max
  class LaunchData
    Data = Data.define(:user_id, :chat_id, :first_name, :last_name, :photo_url, :start_param)

    MAX_AGE = 1.hour
    CLOCK_SKEW = 30.seconds

    def initialize(raw, bot_token:)
      @raw = raw
      @bot_token = bot_token
    end

    def data
      return @data if defined?(@data)

      # MAX uses decodeURIComponent: literal '+' stays '+'.
      encoded_fields = @raw.gsub("+", "%2B")
      pairs = URI.decode_www_form(encoded_fields)
      fields = pairs.to_h
      raise ArgumentError, "Duplicate MAX launch fields" unless fields.size == pairs.size

      verify_signature!(fields)
      verify_timestamp!(fields)
      user = parse_identity!(fields.fetch("user"))
      chat = parse_identity!(fields.fetch("chat", "null"), optional: true)
      raise ArgumentError, "Invalid MAX user id" unless user.fetch("id").positive?

      @data = Data.new(
        user["id"].to_s,
        chat&.dig("id")&.to_s,
        user["first_name"],
        user["last_name"],
        user["photo_url"],
        fields["start_param"],
      )
    rescue JSON::ParserError, KeyError
      raise ArgumentError, "Invalid MAX launch data"
    end

    private

    def parse_identity!(raw, optional: false)
      identity = JSON.parse(raw)
      return if optional && identity.nil?

      unless identity.is_a?(Hash) && identity["id"].is_a?(Integer) && identity["id"] != 0
        raise ArgumentError, "Invalid MAX identity"
      end

      identity
    end

    def verify_signature!(fields)
      signed_fields = fields.except("hash").sort
      check_lines = signed_fields.map do |key, value|
        "#{key}=#{value}"
      end
      check_string = check_lines.join("\n")
      secret = OpenSSL::HMAC.digest("SHA256", "WebAppData", @bot_token)
      expected = OpenSSL::HMAC.hexdigest("SHA256", secret, check_string)
      signature = fields.fetch("hash")
      unless ActiveSupport::SecurityUtils.secure_compare(expected, signature)
        raise ArgumentError, "Invalid MAX signature"
      end
    end

    def verify_timestamp!(fields)
      current_time = Time.current.to_i
      authenticated_at = Integer(fields.fetch("auth_date"), 10)
      age = current_time - authenticated_at
      unless age.between?(-CLOCK_SKEW, MAX_AGE)
        raise ArgumentError, "Expired MAX launch data"
      end
    end
  end
end
