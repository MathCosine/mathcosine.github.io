# how to edit this site

You can edit everything on github.com: open a file, press the pencil icon, change it, then press **commit changes**. The site at **https://mathcosine.github.io/** rebuilds itself about a minute later.

## where everything lives

| to change... | edit this |
| --- | --- |
| About (your intro) | `index.md`: the text below the second `---` |
| Highlights (the dated list) | `highlights:` at the top of `index.md` |
| Research | `research:` at the top of `index.md` |
| photo, name, school, email, icons on the left | `profile:` in `_config.yml` (photo file is `assets/img/thomas.jpg`) |
| links in the red top bar | `nav:` in `_config.yml` |
| Contact section | `contact:` in `_config.yml` |
| notes & handouts | `notes.md`, and put the pdfs in `files/` |
| colors and fonts | top of `assets/css/style.css` |

**Adding a highlight:** copy two lines like these into `highlights:` (newest at the top):

```
  - date: 2026
    text: Perfect score on the AMC 10.
```

`text` can have **bold** and [links](https://example.com). If it starts with `[` or contains `: ` (colon + space), wrap the whole text in "quotes".

**Adding a research project:** same idea, under `research:`, with `title`, `kind` (like "Independent research"), `when` (like "Ongoing" or "2026"), and `text`.

**Notes sections:** at the top of `notes.md` there's a `categories:` list. Give each note a `category:` that matches one of the names. A new name just gets its own section at the bottom. A section only shows up once it has at least one note, and once there are two or more, buttons appear at the top to filter by section.

If the site breaks after an edit, it's almost always the spacing in the `---` part: every line in a list needs the same indentation as the ones around it.

## the locked section

"Other Honors & Activities" on the home page is locked with a password. It's scrambled (AES encryption) before it ever goes in the repo, so people can't read it even by looking at the code. They can only see that something locked is there.

There's no edit button on the site, on purpose. To change what's in it (or the password), the text has to be unscrambled and locked again with the password, which can't be done by hand on github. Ask Claude to do it, saying what to change.

## adding a new page

Make a new file, for example `projects.md`:

```
---
layout: page
title: Projects
permalink: /projects/
---

Anything you want, in markdown.
```

Then add it to `nav:` in `_config.yml`:

```
  - title: Projects
    url: /projects/
```

## math

Write math as `$$x^2$$` (it works inline too). In the locked section, `$x^2$` works as well.

## preview on your own computer (optional)

```
gem install jekyll -v 3.10.0 kramdown-parser-gfm webrick
jekyll serve
```

Then open http://localhost:4000/
