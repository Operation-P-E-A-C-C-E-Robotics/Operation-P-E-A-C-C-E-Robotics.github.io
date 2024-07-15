---
layout: default
published: true
title: "Forms"
form: "/forms/"
---

<br>
<div class="container" style="height: 30vh; margin: 15vh auto;">
    <ul class="nav flex-column mx-auto text-center font-weight-bold">
        {% assign forms = site.forms | where_exp: "item", "item.title != 'Forms'" | sort_natural %}
        {% for form in forms%}
        <li>
          <a href="{{form.url}}" class="h1">{{form.title | captialize}}</a>  
        </li> 
        <br>
        {% endfor %}
    </ul>
</div>