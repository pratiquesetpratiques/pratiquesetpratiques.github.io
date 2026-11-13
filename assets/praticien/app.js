"use strict";

const english = document.documentElement.lang === "en-US";
const locale = english ? "en-US" : "fr";
const translate = (french, american) => english ? american : french;
const catalogue = window.PRATICIEN;
const byId = id => document.getElementById(id);
const sectionNames = {
  GBD: "Guides bibliographiques & documentaires",
  LEAS: "Librarians & Editors for Ancient Studies. Voices",
  BAW: "Bridging Ancient Worlds"
};
const languages = {fr: "Français", en: "Anglais"};
const englishLabels = (english && window.PRATICIEN_EN?.labels) || {};
const displayLabel = value => Object.hasOwn(englishLabels, value)
  ? englishLabels[value] : catalogue?.gestureLabels?.[value] ?? value;
const facets = [
  ["disciplines", "Discipline", "Disciplines"], ["topics", translate("Sujet", "Topic"), translate("Sujets", "Topics")],
  ["periods", translate("Période", "Period"), translate("Périodes", "Periods")],
  ["sources", translate("Source ou corpus", "Source or corpus"), translate("Sources et corpus", "Sources and corpora")],
  ["methods", translate("Méthode", "Method"), translate("Méthodes", "Methods")],
  ["places", translate("Lieu", "Place"), translate("Lieux", "Places")],
  ["section", translate("Rubrique", "Section"), translate("Rubriques", "Sections")],
  ["language", translate("Langue", "Language"), translate("Langues", "Languages")]
];
const facetLabels = new Map([["gestures", translate("Geste", "Practice")], ...facets]);
const disciplineOrder = ["Égyptologie", "Histoire ancienne", "Bibliothéconomie"];
const quickAxes = ["topics", "sources", "methods", "places", "periods"];
const quickStarts = [
  ["sources", "Textes des Sarcophages"], ["places", "Tsukuba"], ["topics", "Antigonides"]
];
const detourKeywords = new Map([
  [1, "Antigonides"], [3, "Ka royal"],
  [2, "Changchun"], [9, "Libre accès diamant"],
  [5, "Platon et l’Égypte"], [6, "Égyptomanie américaine"]
]);
const collator = new Intl.Collator(locale, {sensitivity: "base", numeric: true});
const state = {query: "", filters: new Map(), article: null, detour: null, nextDetour: 0};

function node(tag, className, content) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content !== undefined) element.textContent = content;
  return element;
}

function button(label, className, onClick) {
  const element = node("button", className, label);
  element.type = "button";
  element.addEventListener("click", onClick);
  return element;
}

function link(label, url, className) {
  const element = node("a", className, label);
  element.href = url;
  element.target = "_blank";
  element.rel = "noopener noreferrer";
  return element;
}

function normalize(text) {
  return String(text ?? "").toLocaleLowerCase(locale).normalize("NFD")
    .replace(/(?<=\p{Script=Latin})\p{M}+/gu, "").replaceAll("œ", "oe").replaceAll("æ", "ae")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, " ").trim();
}

function termsOf(query) {
  return [...query.matchAll(/"([^"]+)"|([^"\s]+)/g)]
    .map(part => normalize(part[1] || part[2])).filter(Boolean);
}

function contains(field, term) {
  if (/[\p{Script=Han}\p{Script=Katakana}\p{Script=Hiragana}]/u.test(term)) return field.includes(term);
  return (" " + field + " ").includes(" " + term + " ");
}

function valuesOf(article, key) {
  if (key === "section") return [sectionNames[article.section]];
  if (key === "language") return [languages[article.language] || article.language];
  return article[key] || [];
}

const articles = (catalogue?.articles || []).map(article => {
  const tagText = [...facets.map(([key]) => valuesOf(article, key)).flat(), ...article.gestures];
  const visibleLabels = tagText.map(displayLabel);
  for (const word of catalogue.words) {
    if (valuesOf(article, word.key).includes(word.value)) visibleLabels.push(word.label);
  }
  tagText.push(...visibleLabels);
  return {...article, indexedReferences: article.bibliography.map(entry => ({
    entry, text: normalize(entry.citation)
  })), fields: {
    title: normalize([article.title, article.author, article.doi].join(" ")),
    tags: normalize(tagText.join(" ")),
    context: normalize([article.lead, article.keywords, ...article.aliases,
      ...article.evidence.map(entry => entry.label + " " + entry.detail)].join(" "))
  }};
});
const articlesById = new Map(articles.map(article => [article.id, article]));

function rank(article, terms) {
  let score = 0;
  const missing = [];
  for (const term of terms) {
    const {title, tags, context} = article.fields;
    if (contains(title, term)) score += 12;
    else if (contains(tags, term)) score += 8;
    else if (contains(context, term)) score += 3;
    else missing.push(term);
  }
  if (missing.length && !article.indexedReferences.some(reference => missing.every(term => contains(reference.text, term)))) {
    return -1;
  }
  return score + 6 * missing.length;
}

function referenceMatch(article, terms) {
  if (!terms.length) return null;
  const full = article.indexedReferences.find(reference => terms.every(term => contains(reference.text, term)));
  if (full) return {entry: full.entry, terms};
  const missing = terms.filter(term => !Object.values(article.fields).some(field => contains(field, term)));
  if (!missing.length) return null;
  const partial = article.indexedReferences.find(reference => missing.every(term => contains(reference.text, term)));
  return partial ? {entry: partial.entry, terms: missing} : null;
}

function rankedArticles() {
  const terms = termsOf(state.query);
  return articles.map(article => ({article, score: rank(article, terms)}))
    .filter(item => item.score >= 0)
    .sort((a, b) => b.score - a.score
      || Number(b.article.disciplines.includes("Égyptologie")) - Number(a.article.disciplines.includes("Égyptologie"))
      || a.article.id - b.article.id)
    .map(item => item.article);
}

function matchesFilters(article, excludedKey) {
  for (const [key, selected] of state.filters) {
    if (key === excludedKey) continue;
    if (!valuesOf(article, key).some(value => selected.has(value))) return false;
  }
  return true;
}

function countsFor(ranked, key) {
  const counts = new Map();
  for (const article of ranked) {
    if (!matchesFilters(article, key)) continue;
    for (const value of valuesOf(article, key)) counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
}

function changeFilter(key, value) {
  const selected = state.filters.get(key) || new Set();
  if (selected.has(value)) selected.delete(value);
  else selected.add(value);
  if (selected.size) state.filters.set(key, selected);
  else state.filters.delete(key);
  state.detour = null;
  state.article = null;
  render();
}

function discoveryChoices(ranked, visible, key) {
  const current = new Map();
  for (const article of visible) {
    for (const value of valuesOf(article, key)) current.set(value, (current.get(value) || 0) + 1);
  }
  const selected = state.filters.get(key);
  const priority = value => {
    const index = disciplineOrder.indexOf(value);
    return index < 0 ? disciplineOrder.length : index;
  };
  return [...countsFor(ranked, key)].filter(([value]) => !selected?.has(value))
    .map(([value, count]) => ({key, value, count, inView: current.get(value) || 0}))
    .sort((a, b) => Number(b.inView > 0) - Number(a.inView > 0)
      || (key === "disciplines" ? priority(a.value) - priority(b.value) : 0)
      || b.inView - a.inView || b.count - a.count || collator.compare(displayLabel(a.value), displayLabel(b.value)));
}

function discoveryButton({key, value, count}, quick = false) {
  const control = button("", "discovery-term", () => {
    const inMore = Boolean(control.closest(".discovery-more"));
    changeFilter(key, value);
    const group = byId(quick ? "quick-discovery" : "facet-" + key);
    const primary = group?.querySelector(quick ? ".discovery-term" : ":scope > .discovery-options .discovery-term");
    const more = inMore ? group?.querySelector(".discovery-more[open] .discovery-term") : null;
    const summary = group?.querySelector(".discovery-more summary");
    (more || primary || summary || byId("filter-toggle")).focus({preventScroll: true});
  });
  control.dataset.key = key;
  control.dataset.value = value;
  const number = node("span", "discovery-count", String(count));
  number.setAttribute("aria-hidden", "true");
  const label = displayLabel(value);
  control.append(node("span", "discovery-label", label), number);
  const publicationCount = count + (count === 1 ? " publication" : " publications");
  control.setAttribute("aria-label", translate(`Explorer « ${label} », ${publicationCount}`, `Explore “${label}”, ${publicationCount}`));
  return control;
}

function renderQuickDiscovery(choices) {
  const area = byId("quick-discovery");
  if (!area) return;
  const chosen = [];
  const used = new Set();
  const entered = normalize(state.query);
  const canSuggest = choice => choice?.inView && !used.has(normalize(displayLabel(choice.value)))
    && (!entered || ![choice.value, displayLabel(choice.value)].some(value => contains(entered, normalize(value))));
  function add(choice) {
    if (chosen.length === 3 || !canSuggest(choice)) return;
    used.add(normalize(displayLabel(choice.value)));
    chosen.push(choice);
  }
  if (!state.query && !state.filters.size && !state.detour) {
    for (const [key, value] of quickStarts) add(choices.get(key).find(choice => choice.value === value));
  }
  for (const key of quickAxes) add(choices.get(key).find(canSuggest));
  for (const key of quickAxes) for (const choice of choices.get(key)) add(choice);
  area.replaceChildren(...chosen.map(choice => discoveryButton(choice, true)));
  area.hidden = !chosen.length;
}

function renderFacets(ranked, visible) {
  const area = byId("facets");
  const choices = new Map(facets.map(([key]) => [key, discoveryChoices(ranked, visible, key)]));
  renderQuickDiscovery(choices);
  if (!area.hidden) {
    const expanded = new Set([...area.querySelectorAll(".discovery-more[open]")].map(details => details.dataset.key));
    const groups = [];
    for (const [key, , label] of facets) {
      const available = choices.get(key);
      if (!available.length) continue;
      const group = node("section", "discovery-group");
      group.id = "facet-" + key;
      group.append(node("h3", "discovery-heading", label));
      const primary = available.filter(choice => choice.inView > 0).slice(0, 3);
      const remaining = available.filter(choice => !primary.includes(choice));
      if (primary.length) {
        const options = node("div", "discovery-options");
        options.append(...primary.map(choice => discoveryButton(choice)));
        group.append(options);
      }
      if (remaining.length) {
        const details = node("details", "discovery-more");
        details.dataset.key = key;
        details.open = expanded.has(key);
        const other = remaining.length === 1
          ? translate("1 autre piste", "1 more suggestion")
          : remaining.length + translate(" autres pistes", " more suggestions");
        const summary = node("summary", "", other);
        const options = node("div", "discovery-options");
        options.append(...remaining.map(choice => discoveryButton(choice)));
        details.append(summary, options);
        group.append(details);
      }
      groups.push(group);
    }
    area.replaceChildren(...(groups.length ? groups : [node("p", "discovery-empty",
      translate("Aucune piste pour cette recherche.", "No reading suggestions for this search."))]));
  }

  const active = byId("active-filters");
  const chips = [];
  for (const [key, values] of state.filters) {
    for (const value of values) {
      const label = displayLabel(value);
      const chip = button(label + " ×", "chip", () => {
        changeFilter(key, value);
        byId("filter-toggle").focus();
      });
      const facet = facetLabels.get(key);
      chip.setAttribute("aria-label", translate(`Retirer le filtre ${facet} « ${label} »`, `Remove ${facet.toLowerCase()} filter “${label}”`));
      chips.push(chip);
    }
  }
  const count = byId("filter-count");
  count.hidden = !chips.length;
  count.textContent = chips.length;
  active.hidden = !chips.length;
  if (chips.length) {
    chips.push(button(translate("Effacer les filtres", "Clear filters"), "clear-filters", () => {
      state.filters.clear();
      state.detour = null;
      state.article = null;
      render();
      byId("filter-toggle").focus();
    }));
  }
  active.replaceChildren(...chips);
}

function tagButtons(article, key, limit) {
  const container = node("div", "card-tags");
  const values = valuesOf(article, key).slice(0, limit);
  for (const value of values) {
    const tag = button(displayLabel(value), "card-tag", () => {
      changeFilter(key, value);
      byId("results-panel").focus({preventScroll: true});
    });
    tag.setAttribute("aria-pressed", String(state.filters.get(key)?.has(value) || false));
    container.append(tag);
  }
  return container;
}

function articleCard(article) {
  const card = node("article", "result-card");
  card.dataset.section = article.section;
  const number = node("span", "issue-number", article.id);
  number.setAttribute("aria-hidden", "true");
  const content = node("div", "article-content");
  const meta = node("p", "article-meta", article.author + " · " + article.section + " · " + article.year);
  const title = button(article.title, "article-title", () => openArticle(article));
  title.lang = article.language;
  const arrow = node("span", "", "→");
  arrow.setAttribute("aria-hidden", "true");
  title.append(arrow);
  const heading = node("h3", "card-heading");
  heading.append(title);
  content.append(meta, heading, node("p", "article-lead", article.lead), tagButtons(article, "topics", 2));
  const reference = referenceMatch(article, termsOf(state.query));
  if (reference) content.append(node("p", "reference-match", translate("Référence repérée", "Matching reference") + " · " + reference.entry.citation));
  card.append(number, content);
  return card;
}

function pdfPage(article, page) {
  return article.pdf + "#page=" + page;
}

async function copyReference(text, control) {
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    const field = node("textarea", "visually-hidden");
    field.value = text;
    document.body.append(field);
    field.select();
    try { copied = document.execCommand("copy"); }
    catch { copied = false; }
    field.remove();
    control.focus();
  }
  byId("feedback").textContent = copied
    ? translate("Référence copiée.", "Citation copied.")
    : translate("Sélectionnez le texte de la référence pour le copier.", "Select the citation text to copy it.");
  if (copied) {
    const previous = control.textContent;
    control.textContent = translate("Copiée ✓", "Copied ✓");
    setTimeout(() => { control.textContent = previous; }, 1250);
  }
}

function citationControl(text) {
  const control = button(translate("Copier la référence", "Copy citation"), "small-button", () => copyReference(text, control));
  return control;
}

function bibliographyView(article) {
  const area = node("section", "bibliography");
  const title = node("h3", "", translate("Références choisies du guide", "Selected references from the guide"));
  const input = node("input", "reference-search");
  input.type = "search";
  input.placeholder = translate("Chercher un auteur ou un titre dans cette sélection", "Search these references by author or title");
  input.setAttribute("aria-label", input.placeholder);
  const list = node("div");
  const current = termsOf(state.query);
  const match = referenceMatch(article, current);
  if (match) input.value = match.terms.length === current.length ? state.query : match.terms.map(term => '"' + term + '"').join(" ");
  function update() {
    const terms = termsOf(input.value);
    const groups = new Map();
    for (const entry of article.bibliography) {
      if (!terms.every(term => contains(normalize(entry.citation), term))) continue;
      if (!groups.has(entry.level)) groups.set(entry.level, []);
      groups.get(entry.level).push(entry);
    }
    const blocks = [];
    for (const [level, entries] of groups) {
      const heading = node("h4", "", level);
      const rows = node("ul", "citation-list");
      for (const entry of entries) {
        const row = node("li", "", entry.citation);
        const actions = node("div", "citation-actions");
        actions.append(link(translate("Dans le guide, p. ", "In the guide, p. ") + entry.page, pdfPage(article, entry.page)));
        if (entry.url) actions.append(link(translate("Voir la référence ↗", "View reference ↗"), entry.url));
        actions.append(citationControl(entry.citation));
        row.append(actions);
        rows.append(row);
      }
      blocks.push(heading, rows);
    }
    list.replaceChildren(...(blocks.length ? blocks : [node("p", "empty-results",
      translate("Aucune référence dans cette sélection.", "No matching references in this selection."))]));
  }
  input.addEventListener("input", update);
  area.append(title, input, list);
  update();
  return area;
}

function openArticle(article) {
  state.article = article.id;
  renderArticle(article);
  const detail = byId("article-detail");
  detail.querySelector("h2").focus({preventScroll: true});
  if (matchMedia("(max-width: 670px)").matches) byId("results-panel").scrollIntoView({block: "start"});
}

function renderArticle(article) {
  const detail = byId("article-detail");
  detail.dataset.section = article.section;
  resultJump.hidden = true;
  byId("results-home").hidden = true;
  detail.hidden = false;
  const back = button(translate("← Retour aux publications", "← Back to publications"), "back-button", () => {
    const previous = state.article;
    state.article = null;
    render();
    const target = byId("result-" + previous) || byId("results-panel");
    target.focus({preventScroll: true});
  });
  const title = node("h2", "", article.title);
  title.lang = article.language;
  title.tabIndex = -1;
  const quotedTitle = translate(`« ${article.title} ».`, `“${article.title}.”`);
  const cite = `${article.author}. ${quotedTitle} Pratiques et pratiques, ${article.year}/${article.id}. https://doi.org/${article.doi}`;
  const actions = node("div", "detail-actions");
  actions.append(link(translate("Lire le PDF ↗", "Read the PDF ↗"), article.pdf, "read-link"),
    link(translate("Notice et DOI ↗", "Publication record and DOI ↗"), article.url), citationControl(cite));
  const meta = node("p", "article-meta", article.author + " · " + article.year + "/" + article.id + " · " + displayLabel(sectionNames[article.section]));
  const content = [back, title, meta, node("p", "article-lead", article.lead), actions];

  const evidence = node("ul", "article-evidence");
  for (const entry of article.evidence) {
    const row = node("li");
    row.append(node("strong", "", entry.label), node("p", "", entry.detail));
    if (entry.page) row.append(link("PDF p. " + entry.page, pdfPage(article, entry.page)));
    evidence.append(row);
  }
  content.push(node("h3", "", translate("Dans cette publication", "In this publication")), evidence);
  if (article.bibliography.length) content.push(bibliographyView(article));
  content.push(node("h3", "", translate("Explorer ce sujet", "Explore this topic")), tagButtons(article, "topics", Infinity));

  const related = (catalogue.detours || []).filter(pair => pair.ids.includes(article.id));
  if (related.length) {
    const section = node("section", "related");
    section.append(node("h3", "", translate("& poursuivre la lecture", "& keep reading")));
    for (const pair of related) {
      const next = articlesById.get(pair.ids.find(id => id !== article.id));
      section.append(button(pair.title + " ↗", "related-link", () => openArticle(next)), node("p", "article-lead", pair.reason));
    }
    content.push(section);
  }
  detail.replaceChildren(...content);
}

const globe = createGlobe(byId("globe-stage"), catalogue?.words || [], changeFilter, locale, displayLabel);
const resultJump = byId("result-jump");
const resultsList = byId("results");
function updateResultsFade() {
  const visibleHeight = resultsList.clientHeight;
  const remaining = resultsList.scrollHeight - visibleHeight - resultsList.scrollTop;
  resultsList.classList.toggle("has-more-results", visibleHeight > 0 && remaining > 1);
}
resultsList.addEventListener("scroll", updateResultsFade, {passive: true});
if (typeof ResizeObserver === "function") new ResizeObserver(updateResultsFade).observe(resultsList);
else window.addEventListener("resize", updateResultsFade);
document.fonts?.ready.then(updateResultsFade);

let beforeDetour = null;
const listButtons = new Map(globe.gestures.map(value => [value, button(displayLabel(value), "", () => {
  changeFilter("gestures", value);
})]));
byId("gesture-options").append(...listButtons.values());

function availableDetours(visible) {
  const ids = new Set(visible.map(article => article.id));
  return (catalogue?.detours || []).filter(pair => pair.ids.every(id => ids.has(id)));
}

function detourEndpoints(detour) {
  const [first, second] = detour.ids.map(id => articlesById.get(id));
  const firstGesture = first.gestures.find(gesture => second.gestures.some(other => other !== gesture));
  if (firstGesture) {
    return [firstGesture, second.gestures.find(gesture => gesture !== firstGesture)]
      .map(value => ({key: "gestures", value}));
  }

  function keywordsFor(article) {
    const words = (catalogue.words || []).filter(word => valuesOf(article, word.key).includes(word.value));
    const featured = words.find(word => word.value === detourKeywords.get(article.id));
    return featured ? [featured, ...words.filter(word => word !== featured)] : words;
  }

  const secondWords = keywordsFor(second);
  const firstWord = keywordsFor(first).find(word => secondWords.some(other => other !== word));
  if (!firstWord) return [];
  return [firstWord, secondWords.find(word => word !== firstWord)].map(({key, value}) => ({key, value}));
}

function leaveDetour() {
  if (!state.detour) return;
  const previous = beforeDetour;
  state.detour = null;
  state.article = previous?.article ?? null;
  render();
  if (previous) {
    globe.restoreOrientation(previous.orientation);
    resultsList.scrollTop = previous.resultsScroll;
    updateResultsFade();
    window.scrollTo(0, previous.pageScroll);
  }
  byId("detour-button").focus({preventScroll: true});
}

function render() {
  if (!state.detour) beforeDetour = null;
  byId("detour-return").hidden = !state.detour;
  const ranked = rankedArticles();
  const visible = ranked.filter(article => matchesFilters(article));
  const eligible = availableDetours(visible);
  const shown = state.detour ? visible.filter(article => state.detour.ids.includes(article.id)) : visible;
  const counts = countsFor(ranked, "gestures");
  const selected = state.filters.get("gestures") || new Set();
  const connected = state.detour ? detourEndpoints(state.detour) : [];
  const cloudCounts = new Map(globe.keys.map(key => [key, key === "gestures" ? counts : countsFor(ranked, key)]));
  globe.update(cloudCounts, state.filters, connected, Boolean(state.query || state.filters.size));
  for (const [value, control] of listButtons) {
    control.disabled = !selected.has(value) && !counts.get(value);
    control.setAttribute("aria-pressed", String(selected.has(value)));
  }
  renderFacets(ranked, shown);
  byId("detour-button").disabled = !eligible.length;
  const current = state.article && articlesById.get(state.article);
  if (current) {
    renderArticle(current);
    return;
  }
  byId("article-detail").hidden = true;
  byId("results-home").hidden = false;
  byId("results-title").textContent = state.detour ? translate("Un détour", "A detour")
    : (state.query || state.filters.size ? translate("Publications trouvées", "Matching publications") : translate("À explorer", "Explore the journal"));
  const publicationCount = shown.length + (shown.length === 1 ? " publication" : " publications");
  byId("result-count").textContent = publicationCount;
  resultJump.hidden = !(state.query || state.filters.size || state.detour);
  resultJump.textContent = shown.length === 1 ? translate("Voir la publication ↓", "View the publication ↓")
    : shown.length ? translate(`Voir les ${publicationCount} ↓`, `View ${publicationCount} ↓`) : translate("Voir les résultats ↓", "View results ↓");
  const note = byId("detour-note");
  note.hidden = !state.detour;
  if (state.detour) {
    note.replaceChildren(node("strong", "", state.detour.title), node("p", "", state.detour.reason),
      button(translate("Revenir aux résultats", "Back to results"), "small-button", leaveDetour));
  } else note.replaceChildren();
  const cards = shown.map(article => {
    const card = articleCard(article);
    card.querySelector("button").id = "result-" + article.id;
    return card;
  });
  if (!cards.length) cards.push(node("p", "empty-results", articles.length
    ? translate("Aucune publication pour cette recherche.", "No publications match this search.")
    : translate("Le catalogue n’a pas pu être chargé.", "The catalog could not be loaded.")));
  resultsList.replaceChildren(...cards);
  resultsList.scrollTop = 0;
  updateResultsFade();
}

function readQuery() {
  state.query = byId("query").value.trim();
  state.article = null;
  state.detour = null;
  render();
}

byId("query").addEventListener("input", readQuery);
resultJump.addEventListener("click", event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const panel = byId("results-panel");
  panel.focus({preventScroll: true});
  panel.scrollIntoView({block: "start"});
});
byId("search").addEventListener("submit", event => {
  event.preventDefault();
  readQuery();
  byId("results-panel").focus({preventScroll: true});
  if (matchMedia("(max-width: 670px)").matches) byId("results-panel").scrollIntoView({block: "start"});
});
for (const control of document.querySelectorAll("[data-example]")) {
  control.addEventListener("click", () => {
    byId("query").value = control.dataset.example;
    state.filters.clear();
    readQuery();
  });
}
byId("filter-toggle").addEventListener("click", () => {
  const area = byId("facets");
  area.hidden = !area.hidden;
  byId("filter-toggle").setAttribute("aria-expanded", String(!area.hidden));
  byId("filter-indicator").textContent = area.hidden ? "+" : "−";
  const ranked = rankedArticles();
  const visible = ranked.filter(article => matchesFilters(article) && (!state.detour || state.detour.ids.includes(article.id)));
  renderFacets(ranked, visible);
});
byId("gesture-toggle").addEventListener("click", () => {
  const area = byId("gesture-options");
  area.hidden = !area.hidden;
  byId("gesture-toggle").setAttribute("aria-expanded", String(!area.hidden));
});
byId("detour-button").addEventListener("click", () => {
  const eligible = availableDetours(rankedArticles().filter(article => matchesFilters(article)));
  if (!eligible.length) return;
  if (!state.detour) {
    beforeDetour = {
      article: state.article,
      orientation: globe.getOrientation(),
      resultsScroll: byId("results").scrollTop,
      pageScroll: window.scrollY
    };
  }
  state.detour = eligible[state.nextDetour % eligible.length];
  state.nextDetour++;
  state.article = null;
  render();
  if (matchMedia("(max-width: 670px), (orientation: landscape) and (max-height: 500px)").matches) {
    byId("globe-stage").scrollIntoView({block: "center"});
  }
});
byId("detour-return").addEventListener("click", leaveDetour);
render();
