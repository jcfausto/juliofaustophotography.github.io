---
layout: legal
title: Impressum
subtitle: Legal notice
description: Legal notice (Impressum) for juliofaustophotography.com.
permalink: /impressum/
legal: true
---

{%- assign legal = site.data.legal -%}

## Information according to § 5 DDG

{% include legal-address.html %}

## Contact

Email: [{{ legal.email }}](mailto:{{ legal.email }})
{%- if legal.phone != "" %}<br>
Phone: {{ legal.phone }}
{%- endif %}

{% if legal.vat_id != "" -%}
## VAT identification number

VAT identification number according to § 27a UStG: {{ legal.vat_id }}
{%- endif %}

## Responsible for content according to § 18 (2) MStV

{% include legal-address.html %}

## Consumer dispute resolution

I am neither willing nor obliged to take part in dispute resolution
proceedings before a consumer arbitration board (Verbraucherschlichtungsstelle).

## Copyright

The photographs, texts, and design of this website are protected by copyright.
Any use beyond what copyright law allows requires my prior written consent.
See the [license]({{ '/LICENSE' | relative_url }}) for details.
