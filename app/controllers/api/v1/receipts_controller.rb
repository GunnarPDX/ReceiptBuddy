# frozen_string_literal: true

module Api::V1
  class ReceiptsController < ApplicationController

    require 'open-uri'
    require 'net/http'
    require 'uri'
    require 'json'

    def index
      render json: Receipt.all, status: 200
    end

    def create
      if user_signed_in?
        receipt = Receipt.create(receipt_params)
        if receipt
          if transcribe(receipt)
            render json: { message: 'success' }, status: 201
          else
            render json: { message: 'GCS transcription failure' }, status: 500
          end
        else
          render json: { message: 'failure to create' }, status: 400
        end
      else
        render json: {}, status: 401
      end
    end

    def transcribe(receipt)
      img_url = 'https://res.cloudinary.com/dmqtrnawm/image/upload/q_auto:low/' + receipt.image + '.jpg'
      uri = URI.parse('https://vision.googleapis.com/v1/images:annotate?key=' + 'XXXX')
      request = Net::HTTP::Post.new(uri)
      request.content_type = 'application/json'
      request.body = JSON.dump('requests' => [{ 'image' => { 'source' => { 'imageUri' => img_url } }, 'features' => [{ 'type' => 'TEXT_DETECTION', 'maxResults' => 1, 'model' => 'builtin/latest' }] }])
      req_options = { use_ssl: uri.scheme == 'https' }
      response = Net::HTTP.start(uri.hostname, uri.port, req_options) do |http|
        http.request(request)
      end

      # These can be helpful for working out issues
      p response
      p response.code
      p response.body

      # if response.code.equal?()

      data = JSON.parse(response.body)

      if data.blank? || data['responses'][0].blank? || data['responses'][0]['textAnnotations'][0].blank? || data['responses'][0]['textAnnotations'][0]['description'].blank?
        receipt.destroy!
      else
        transcription = data['responses'][0]['textAnnotations'][0]['description']


        possible_totals = transcription.scan(/[0-9]{1,15}\.[0-9]{2}\b/)
        possible_totals = possible_totals.map!(&:to_f)
        # p possible_totals

        total = possible_totals.max
        total = 'None Found' if total.blank?
        # p total

        date = transcription.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/).to_s
        if date.blank?
          date = transcription.match(/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]|(?:Jan|Mar|May|Jul|Aug|Oct|Dec)))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2]|(?:Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)(?:0?2|(?:Feb))\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9]|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep))|(?:1[0-2]|(?:Oct|Nov|Dec)))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/).to_s
        end
        date = 'None Found' if date.blank?
        # p date

        receipt.total = total
        receipt.date = date
        receipt.save!
      end
    end

    def receipt_params
      params.require(:receipt).permit(:image)
    end

  end
end
