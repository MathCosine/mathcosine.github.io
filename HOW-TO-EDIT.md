# how to edit this site

You can edit everything on github.com: open a file, press the pencil icon, change it, then press **commit changes**. The site rebuilds itself in a minute or two.

## first time only: turn the site on

1. Go to **Settings** (the General page). Under "Repository name", change `mathcosine` to `mathcosine.github.io` and press **Rename**. That name is what puts the site at https://mathcosine.github.io/ with nothing after it.
2. Go to **branches** and rename `claude/fervent-hypatia-tybdel` to `main` (pencil icon next to the branch).
3. Go to **Settings → Pages**. Under "Build and deployment", pick **Deploy from a branch**, then branch `main` and folder `/ (root)`, and press **Save**.
4. A couple of minutes later it's live at **https://mathcosine.github.io/**

(If the repo ever ends up with a different name, the site moves to https://mathcosine.github.io/that-name/. In that case, set `baseurl: "/that-name"` and `github_repo` in `_config.yml` to match.)

## where everything lives

| to change... | edit this |
| --- | --- |
| your bio | `index.md`: the text below the second `---` |
| your photo | upload it to `assets/img/`, then set `photo: assets/img/yourfile.jpg` in `index.md` |
| email / links under "say hi" | `socials:` in `index.md` |
| site name, tagline | `_config.yml` |
| the tabs along the top | `tabs:` in `_config.yml` |
| favorites + "lately" | `favorites.md` |
| notes & handouts (+ their categories) | `notes.md`, and put the pdfs in `files/` |
| diary intro line | `diary.md` |
| colors | top of `assets/css/style.css` (light colors first, then the night ones) |

**Handout categories:** at the top of `notes.md` there's a `categories:` list (name, icon, and an optional `about` line). Give each note a `category:` that matches one of the names. A new name you haven't listed just gets its own section at the bottom. A category only shows up once it has at least one note, and once there are two or more, little buttons appear at the top to filter by category.

The photo gets cropped to fit automatically, so you don't need to crop it yourself. If your face ends up cut off, change `photo_focus` in `index.md`. `50% 20%` keeps more of the top and `50% 60%` keeps more of the bottom.

**One YAML gotcha:** in the bits between the `---` lines, if a value has a `: ` (colon + space) or starts with a special character, wrap it in quotes. For example, `thing: "re: zero"`.

## the diary + locked stuff

The diary and "the tryhard stuff" are locked with a password. They're scrambled (AES encryption) before they ever go in the repo, so people can't read them even by looking at the code. They can only see that something locked exists and what date a diary entry has.

**Writing a diary entry:**
1. Go to the site and unlock anything once. A **write** link then shows up at the bottom of every page (or just go to `mathcosine.github.io/write/`).
2. Write the entry, pick a mood, and keep "lock it" checked.
3. Press **make the file**, then **save it on github**. GitHub opens with the file already filled in, so you just press **commit changes**.

You can also leave "lock it" unchecked to post a public entry. Public and locked entries show up together on the diary page.

**Editing a locked entry or block:** unlock it on the site and press **edit**. The write page opens with it filled in. Change it, press **make the file**, copy the result, and paste it over the old text on github.

**Changing the password:** do the edit flow above for each locked thing, typing the new password (twice) on the write page. You can also use different passwords for different things. Whatever password you type gets tried on everything on the page.

**A new locked block** (like another hidden section on the home page): on the write page, pick **locked block** and give it a name. Paste the line it gives you into `_data/locked.yml`, then list it under `locked:` in `index.md`. You can also put `{% include locked.html name="yourname" %}` in any page.

The lock is only as strong as the password, so use a real one, not "cat".

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

Then add it to `tabs:` in `_config.yml`:

```
  - title: projects
    url: /projects/
    icon: star
```

**Icons you can use:** house, book, paper, heart, star, paw, fish, music, mail, code, pencil, lock, yarn, sushi, speech, pi, atom, cap, link, sun, moon, leaf, graph

## math

- In normal pages (`index.md`, `notes.md` and so on), write math as `$$x^2$$`. It works inline too.
- In diary entries, both `$x^2$` and `$$\sum 1/n^2$$` work. The write page shows a live preview.

## preview on your own computer (optional)

```
gem install jekyll -v 3.10.0 kramdown-parser-gfm webrick
jekyll serve
```

Then open http://localhost:4000/
