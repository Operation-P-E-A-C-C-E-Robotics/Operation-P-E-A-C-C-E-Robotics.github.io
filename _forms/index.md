---
layout: default
---
<div class="conatiner mx-auto w-25">
    <h1>Forms</h1>
    <ul>
    {% for form in site.forms %}
    {% if form.title != "Index" | downcase %}
        <li><a href="{{form.url}}">{{form.title}}</a></li>
    {% endif %}
    {% endfor%}
    </ul>
</div>