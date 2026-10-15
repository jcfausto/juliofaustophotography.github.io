# Essays with `status: draft` are only built when JEKYLL_ENV=development
# (the default for `jekyll serve`). Production builds drop them entirely, so
# they get no page, no feed entry, and no sitemap entry.
module EssayDrafts
  class Generator < Jekyll::Generator
    safe true
    priority :highest

    def generate(site)
      return if Jekyll.env == "development"

      essays = site.collections["essays"]
      return unless essays

      drafts, published = essays.docs.partition { |doc| doc.data["status"].to_s.strip.downcase == "draft" }
      return if drafts.empty?

      essays.docs.replace(published)
      Jekyll.logger.info "Essay drafts:", "skipped #{drafts.size} draft essay(s)"
    end
  end
end
