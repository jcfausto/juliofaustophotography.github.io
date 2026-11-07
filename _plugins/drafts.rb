# Essays and field notes with `status: draft` are only built when
# JEKYLL_ENV=development (the default for `jekyll serve`). Production builds
# drop them entirely, so they get no page, no feed entry, and no sitemap entry.
module Drafts
  COLLECTIONS = %w[essays field_notes].freeze

  class Generator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      return if Jekyll.env == "development"

      COLLECTIONS.each do |name|
        collection = site.collections[name]
        next unless collection

        drafts, published = collection.docs.partition { |doc| doc.data["status"].to_s.strip.downcase == "draft" }
        next if drafts.empty?

        collection.docs.replace(published)
        Jekyll.logger.info "Drafts:", "skipped #{drafts.size} draft #{name.tr('_', ' ')}"
      end
    end
  end
end
