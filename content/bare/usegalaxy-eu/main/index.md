---
title: Galaxy Europe
---

<slot name="/bare/usegalaxy-eu/notices" />

<slot name="/bare/usegalaxy-eu/main/jumbotron" />

"Anyone, anywhere in the world should have free, unhindered access to not just my research, but to the research of every great and enquiring mind across the spectrum of human understanding." – Prof. Stephen Hawking

<iframe title="Recent Galaxy Europe news"
 class="resize-y" src="/bare/eu/latest/news/" scrolling="no"
 style="width: 50%; border: none; vertical-align: top">
</iframe>
<iframe title="Recent Galaxy Europe events"
 class="resize-y" src="/bare/eu/latest/events/" scrolling="no"
 style="width: 50%; border: none; vertical-align: top">
</iframe>

<p></p>

<slot name="/bare/usegalaxy-eu/jobs" />

<!-- carousel content -->

<slot name="/eu/data-policy" />

<footer>
<slot name="/footers/eu" />
</footer>

import Gitter from "@/components/Gitter";
<Gitter />
