# Markdown images in field notes and essays are rewritten to the same
# responsive <picture> markup as _includes/picture.html, using the variant
# data in _data/images.yml. Images without variant data are left untouched.
require "cgi"

module ResponsiveProseImages
  IMG_TAG = /<img\s[^>]*>/
  SIZES = "(max-width: 760px) 100vw, 696px"

  module_function

  def attr(tag, name)
    tag[/\s#{name}="([^"]*)"/, 1]
  end

  def picture(tag, info, baseurl)
    src = CGI.unescapeHTML(attr(tag, "src").to_s)
    alt = attr(tag, "alt").to_s
    base = "#{baseurl}#{info["base"]}"
    widths = Array(info["widths"])
    largest = widths.last
    source_is_largest = info["source_is_largest"]

    webp = widths.map { |w| "#{base}-#{w}.webp #{w}w" }.join(", ")
    jpg = widths.map do |w|
      url = (w == largest && source_is_largest) ? "#{baseurl}#{src}" : "#{base}-#{w}.jpg"
      "#{url} #{w}w"
    end.join(", ")
    full = source_is_largest ? "#{baseurl}#{src}" : "#{base}-#{largest}.jpg"
    fallback = widths.include?(1200) && largest != 1200 ? "#{base}-1200.jpg" : full

    %(<picture><source type="image/webp" srcset="#{webp}" sizes="#{SIZES}">) +
      %(<img src="#{fallback}" srcset="#{jpg}" sizes="#{SIZES}" width="#{info["width"]}" height="#{info["height"]}" alt="#{alt}" loading="lazy" decoding="async" data-zoom="#{full}"></picture>)
  end
end

Jekyll::Hooks.register [:field_notes, :essays], :post_convert do |doc|
  images = doc.site.data["images"] || {}
  baseurl = doc.site.config["baseurl"].to_s
  doc.content = doc.content.gsub(ResponsiveProseImages::IMG_TAG) do |tag|
    next tag if tag.include?("srcset=")

    src = CGI.unescapeHTML(ResponsiveProseImages.attr(tag, "src").to_s)
    info = images[src]
    info ? ResponsiveProseImages.picture(tag, info, baseurl) : tag
  end
end
