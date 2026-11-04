# how to edit this site

You can edit everything on github.com: open a file, press the pencil icon, change it, then press **commit changes**. The site rebuilds itself in a minute or two.

## going live

The site is already on: anything you commit to `main` shows up at **https://mathcosine.github.io/** a minute or two later. If you ever rename the repo, the site moves to https://mathcosine.github.io/that-name/. In that case, set `baseurl: "/that-name"` and `github_repo` in `_config.yml` to match.

## where everything lives

| to change... | edit this |
| --- | --- |
| your bio | `index.md`: the text below the second `---` |
| the picture in the frame | upload it to `assets/img/`, then set `photo: assets/img/yourfile.jpg` in `index.md` (also `photo_caption`, and `photo_shape` for square vs. tall) |
| email / links under "say hi" | `socials:` in `index.md` |
| site name, tagline | `_config.yml` |
| the tabs along the top (including the blog link) | `tabs:` in `_config.yml` |
| favorites + "lately" | `favorites.md` |
| notes & handouts (+ their categories) | `notes.md`, and put the pdfs in `files/` |
| colors | top of `assets/css/style.css` (day colors first, then the night ones) |

**Handout categories:** at the top of `notes.md` there's a `categories:` list (name, icon, and an optional `about` line). Give each note a `category:` that matches one of the names. A new name you haven't listed just gets its own section at the bottom. A category only shows up once it has at least one note, and once there are two or more, little buttons appear at the top to filter by category.

The picture gets cropped to fit the frame automatically, so you don't need to crop it yourself. If the wrong part gets cut off, change `photo_focus` in `index.md`. `50% 20%` keeps more of the top and `50% 60%` keeps more of the bottom.

**One YAML gotcha:** in the bits between the `---` lines, if a value has a `: ` (colon + space) or starts with a special character, wrap it in quotes. For example, `thing: "re: zero"`.

## the locked stuff

"The tryhard stuff" on the home page is locked with a password. It's scrambled (AES encryption) before it ever goes in the repo, so people can't read it even by looking at the code. They can only see that something locked is there.

**Editing it:** unlock it on the site and press **edit**. The write page opens with it filled in. Change it, press **lock it**, copy the line it gives you, and paste it over the `achievements:` line in `_data/locked.yml` on github. (Once you've unlocked something, a **write** link also shows up at the bottom of every page, or go to `mathcosine.github.io/write/`.)

**Changing the password:** do the same thing, but type the new password (twice) on the write page.

**A new locked block** (like another hidden section): on the write page, give it a new name, write it, and press **lock it**. Paste the line into `_data/locked.yml`, then list it under `locked:` in `index.md`. You can also put `{% include locked.html name="yourname" %}` in any page.

The lock is only as strong as the password, so use a real one.

## adding a new tab

Make a new file, for example `projects.md`:

```
---
layout: page
title: projects
permalink: /projects/
---

anything you want, in markdown.
```

Then add it to `tabs:` in `_config.yml`. (A tab can also just link somewhere else, like the blog tab does: give it a `url:` that starts with `https://` and it opens in a new tab.)

```
  - title: projects
    url: /projects/
    icon: star
```

**Icons you can use:** house, book, paper, heart, star, sparkle, planet, rocket, moon, sun, paw, fish, music, mail, code, pencil, lock, yarn, sushi, speech, pi, atom, cap, link, leaf, graph

## math

- In normal pages (`index.md`, `notes.md` and so on), write math as `$$x^2$$`. It works inline too.
- In locked blocks, both `$x^2$` and `$$\sum 1/n^2$$` work. The write page shows a live preview.

## preview on your own computer (optional)

```
gem install jekyll -v 3.10.0 kramdown-parser-gfm webrick
jekyll serve
```

Then open http://localhost:4000/
