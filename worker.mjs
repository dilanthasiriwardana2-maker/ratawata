const parliamentPhoto = "https://upload.wikimedia.org/wikipedia/commons/5/5f/New_Sri_Lankan_Parliament_in_Kotte.jpg";
const SITE_LOGO = "https://ratawata.online/assets/ratawata.webp";
const FEEDS = {
  normal: [
    {id:"bbc-sinhala",name:"BBC Sinhala",website:"https://www.bbc.com/sinhala",url:"https://www.bbc.com/sinhala",category:"local"},
    {id:"adaderana",name:"Ada Derana",website:"https://sinhala.adaderana.lk/",url:"https://sinhala.adaderana.lk/rss.php",category:"local"},
    {id:"hiru",name:"හිරු පුවත්",website:"https://www.hirunews.lk/",url:"https://www.hirunews.lk/",category:"local"},
  ],
  breaking: [
    {id:"meteo-alerts-si",name:"ශ්‍රී ලංකා කාලගුණ විද්‍යා දෙපාර්තමේන්තුව",website:"https://meteo.gov.lk/",url:"https://was.meteo.gov.lk/cap/si/rss.xml",category:"weather"}
  ]
};

const TRENDS_URL =
  "https://trends.google.com/trending/rss?geo=LK";
const CATEGORY_NAMES = {
  local: "දේශීය",
  world: "විදේශීය",
  politics: "දේශපාලන",
  business: "ව්‍යාපාර",
  sports: "ක්‍රීඩා",
  gossip: "කලා",
  weather: "කාලගුණය",
  technology: "තාක්ෂණය"
};
const CATEGORY_WORDS = {
  politics: [
    "ජනපති", "ජනාධිපති", "අගමැති", "පාර්ලිමේන්තු",
    "මන්ත්‍රී", "මැතිවරණ", "දේශපාලන", "ආණ්ඩුව",
    "විපක්ෂ", "පක්ෂ", "ඡන්ද", "කැබිනට්",
    "president", "prime minister", "parliament",
    "election", "government", "minister"
  ],
  business: [
    "ව්‍යාපාර", "ආර්ථික", "බැංකු", "කොටස්",
    "ඩොලර්", "රුපියල්", "බදු", "අයවැය",
    "වෙළඳ", "මිල", "ආයෝජන", "රැකියා",
    "business", "economy", "stock market",
    "bank", "dollar", "trade", "market"
  ],
  sports: [
    "ක්‍රිකට්", "ක්‍රීඩා", "පාපන්දු", "තරගය",
    "තරගාවලිය", "ක්‍රීඩක", "ලෝක කුසලාන",
    "ශූරතාව", "කණ්ඩායම",
    "cricket", "football", "sports", "match",
    "tournament", "player", "world cup"
  ],
  gossip: [
    "නළු", "නිළි", "ගායක", "ගායිකා",
    "සිනමා", "ටෙලිනාට්‍ය", "කලා", "සංගීත",
    "චිත්‍රපට"
  ],
  weather: [
    "කාලගුණ", "වැසි", "වර්ෂා", "සුළං",
    "කුණාටු", "අකුණු", "ගංවතුර", "නියඟ",
    "කාලගුණ විද්‍යා", "weather", "rain",
    "storm", "flood", "lightning"
  ],
  technology: [
    "තාක්ෂණ", "අන්තර්ජාල", "කෘත්‍රිම බුද්ධි",
    "AI", "මෘදුකාංග", "සයිබර්", "පරිගණක",
    "ජංගම", "දුරකථන", "technology",
    "artificial intelligence", "cyber",
    "software", "computer", "internet"
  ],
  world: [
    "ඇමරිකා", "ඉන්දියා", "චීනය", "රුසියා",
    "බ්‍රිතාන්‍ය", "පාකිස්තාන", "ඊශ්‍රායල",
    "විදේශ", "ජාත්‍යන්තර", "යුරෝපා",
    "america", "united states", "india",
    "china", "russia", "britain",
    "israel", "iran", "ukraine",
    "international", "foreign", "gulf"
  ]
};

const STOP_WORDS = new Set(("සඳහා සමඟ සහ එක් එකක් කිරීම කළ කරයි වෙයි බව අද හෙට ඊයේ පුවත් පුවත මෙම මෙය එම එහි විසින් ඇති තිබේ ඇත සිට පිළිබඳ වාර්තා අනුව the and for with from this that has have will was were are his her their they said into about after before would could should more been news latest says according which when where there its over under than other those these not off out you your").split(" "));
const SECTION_HINTS = {
  world: /විදෙස්|විදේශීය|ලෝක පුවත්|\b(?:world|international|foreign)\b/i,
  local: /දේශීය|එසැණ|\b(?:local|sri lanka news)\b/i,
  politics: /දේශපාලන|\bpolitics\b/i,
  sports: /ක්‍රීඩා|\bsports?\b/i,
  business: /ව්‍යාපාර|ආර්ථික|\b(?:business|economy|finance)\b/i,
  weather: /කාලගුණ|\bweather\b/i,
  technology: /තාක්ෂණ|\b(?:technology|tech)\b/i,
  gossip: /ගොසිප්|විනෝදාස්වාද|කලා|\b(?:gossip|entertainment)\b/i
};

function decodeXml(value = "") {
  const named = {amp:"&",lt:"<",gt:">",quot:'"',apos:"'",nbsp:" ",ndash:"–",mdash:"—",hellip:"…",rsquo:"’",lsquo:"‘",ldquo:"“",rdquo:"”"};
  return String(value).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name) => {
      const key = name.toLowerCase();
      if (!key.startsWith("#")) return named[key] ?? entity;
      const number = key.startsWith("#x") ? parseInt(key.slice(2), 16) : Number(key.slice(1));
      return number > 0 && number <= 0x10ffff && !(number >= 0xd800 && number <= 0xdfff)
        ? String.fromCodePoint(number) : "";
    });
}

function plain(value = "") {
  return decodeXml(decodeXml(value))
    .replace(/<!\[CDATA\[|\]\]>/gi, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().normalize("NFC");
}

function getTag(xml, name) {
  return xml.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + name + "\\s*>", "i"))?.[1] || "";
}

function attribute(tag, name) {
  return tag.match(new RegExp("\\s" + name + "\\s*=\\s*([\"'])(.*?)\\1", "is"))?.[2] || "";
}

function publicUrl(value, base) {
  if (!String(value).trim()) return "";
  try {
    const parsed = new URL(decodeXml(value).trim(), base);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed.href : "";
  } catch {
    return "";
  }
}

function isHost(url, host) {
  return Boolean(url && new URL(url).hostname.replace(/^www\./, "") === host);
}

function articleHost(feed, url) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (feed.id === "bbc-sinhala") return host === "bbc.com" || host === "bbc.co.uk";
  if (feed.id === "adaderana") return host === "adaderana.lk" || host === "sinhala.adaderana.lk";
  if (feed.category === "weather") return host === "meteo.gov.lk" || host === "was.meteo.gov.lk";
  return host === new URL(feed.website).hostname.replace(/^www\./, "");
}

function normalized(value) {
  return plain(value).toLowerCase().replace(/[\u200b-\u200d\ufeff]/g, "")
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ").trim();
}

function canonicalArticle(value) {
  const url = new URL(value);
  url.hostname = url.hostname.replace(/^www\./, "");
  url.hash = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return url.href;
}

function sameHeadline(left, right) {
  if (left === right) return Boolean(left);
  const a = new Set(left.split(" "));
  const b = new Set(right.split(" "));
  if (Math.min(a.size, b.size) < 5) return false;
  const overlap = [...a].filter(word => b.has(word)).length;
  return overlap / (a.size + b.size - overlap) >= 0.8;
}

function summary(value, title) {
  const cleaned = plain(value);
  if (cleaned.length < 12 || normalized(cleaned) === normalized(title)) return "";
  return cleaned.length <= 320 ? cleaned : cleaned.slice(0, 317).replace(/\s+\S*$/, "") + "…";
}

function feedImage(entry, base) {
  for (const tag of entry.match(/<(?:media:content|media:thumbnail|enclosure)\b[^>]*>/gi) || []) {
    const url = publicUrl(attribute(tag, "url"), base);
    if (url && (/^image\//i.test(attribute(tag, "type")) || /^image$/i.test(attribute(tag, "medium"))
      || /\.(?:jpe?g|png|webp|avif)(?:[?#]|$)/i.test(url))) return url;
  }
  const img = decodeXml(entry).match(/<img\b[^>]*>/i)?.[0];
  return img ? publicUrl(attribute(img, "src"), base) : "";
}

function classify(title, description, hints, fallback) {
  if (fallback === "weather") return "weather";
  const explicit = Object.keys(SECTION_HINTS).find(category =>
    category !== "local" && hints.some(hint => SECTION_HINTS[category].test(hint)));
  if (explicit) return explicit;
  const headline = " " + normalized(title) + " ";
  const body = " " + normalized(description) + " ";
  const score = category => CATEGORY_WORDS[category].reduce((total, keyword) => {
    const value = normalized(keyword);
    const matches = text => /[\u0d80-\u0dff]/.test(value)
      ? text.includes(value) : text.includes(" " + value + " ");
    return total + (matches(headline) ? 4 : matches(body) ? 1 : 0);
  }, 0);
  const topical = ["weather","sports","technology","business","gossip","politics"]
    .map(category => [category, score(category)]).sort((a,b) => b[1] - a[1]);
  if (topical[0][1] >= 4) return topical[0][0];
  if (score("world") >= 4) return "world";
  return topical[0][1] >= 2 ? topical[0][0] : fallback;
}

function buildTags(title, description, category) {
  const tags = new Map();
  const add = value => {
    const key = normalized(value);
    if (key && !tags.has(key) && tags.size < 10) tags.set(key, value);
  };
  add(CATEGORY_NAMES[category]);
  for (const value of [title, description]) {
    const words = plain(value).match(/[\p{L}\p{M}][\p{L}\p{M}\p{N}-]*/gu) || [];
    for (const word of words) {
      const key = normalized(word);
      if (key.length >= 3 && !STOP_WORDS.has(key)) add(word);
    }
  }
  return [...tags.values()];
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function getDocument(url, expected, limit) {
  for (let redirect = 0; redirect <= 1; redirect++) {
    if (!expected(url)) throw new Error("Unexpected source host");
    const response = await fetch(url, {redirect:"manual", signal:AbortSignal.timeout(7000),
      headers:{"User-Agent":"RataWataNewsBot/1.1 (+https://ratawata.online/)"}});
    if ([301,302,303,307,308].includes(response.status)) {
      url = publicUrl(response.headers.get("Location") || "", url);
      continue;
    }
    if (!response.ok) throw new Error("HTTP " + response.status);
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Empty response");
    const decoder = new TextDecoder();
    let data = "", size = 0;
    try {
      while (true) {
        const {done,value} = await reader.read();
        if (done) return {data:data + decoder.decode(),url};
        size += value.byteLength;
        if (size > limit) throw new Error("Response exceeds size limit");
        data += decoder.decode(value,{stream:true});
      }
    } finally {
      await reader.cancel().catch(() => {});
    }
  }
  throw new Error("Too many redirects");
}

function parseFeed(xml, feed) {
  const entries = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)];
  return entries.slice(0, feed.category === "weather" ? 15 : 12).flatMap(([, , entry]) => {
    const title = plain(getTag(entry,"title"));
    const alternate = (entry.match(/<link\b[^>]*>/gi) || []).find(tag =>
      attribute(tag,"href") && ["","alternate"].includes(attribute(tag,"rel")));
    const articleUrl = publicUrl(getTag(entry,"link") || (alternate && attribute(alternate,"href")) || "", feed.website);
    const date = Date.parse(plain(getTag(entry,"pubDate") || getTag(entry,"published") || getTag(entry,"updated") || getTag(entry,"dc:date")));
    if (!title || !articleUrl || articleUrl === feed.website || !articleHost(feed, articleUrl) ||
        !Number.isFinite(date) || date > Date.now() + 300000) return [];
    const texts = ["content:encoded","content","description","summary"]
      .map(tag => plain(getTag(entry,tag)))
      .filter(text => text && normalized(text) !== normalized(title));
    const feedText = texts.reduce((best,text) => text.length > best.length ? text : best,"").slice(0,8500);
    const description = summary(feedText,title);
    const hints = [...entry.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category\s*>/gi)].map(match => plain(match[1]));
    for (const tag of entry.match(/<category\b[^>]*\/>/gi) || []) hints.push(plain(attribute(tag,"term")));
    return [{title,description,feedText,articleUrl,imageUrl:feedImage(entry,articleUrl),hints,publishedAt:new Date(date).toISOString()}];
  });
}

function listingItems(html,feed) {
  const results = new Map();
  for (const anchor of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const link = publicUrl(attribute(anchor[1],"href"),feed.website);
    if (!link || !articleHost(feed,link)) continue;
    const path = new URL(link).pathname;
    const valid = feed.id === "hiru" ? /^\/\d+\//.test(path) : feed.id === "bbc-sinhala" ? /^\/sinhala\/articles\//.test(path) : /^\/news\/\d+/.test(path);
    const title = plain(anchor[2]) || plain(attribute(anchor[1],"title"));
    if (!valid || !/[අ-ෆ]/u.test(title) || title.length<10 || title.length>250 || /කාටූන්/.test(title)) continue;
    results.set(canonicalArticle(link),{articleUrl:link,title,description:"",feedText:"",hints:[],publishedAt:null});
    if (results.size===16) break;
  }
  return [...results.values()];
}

async function fetchFeed(feed) {
  for (const url of [...new Set([feed.url,feed.website])]) {
    try {
      const host = new URL(url).hostname.replace(/^www\./, "");
      const {data} = await getDocument(url, candidate => isHost(candidate,host), 850000);
      const items = /<(rss|feed)\b/i.test(data) ? parseFeed(data,feed) : listingItems(data,feed);
      const usable = feed.category==="weather" ? items : items.filter(item=>/[අ-ෆ]/u.test(item.title) && !/කාටූන්/.test(item.title));
      if (usable.length) return usable;
      if (feed.category === "weather" && /<rss\b|<feed\b/i.test(data)) return [];
      throw new Error("No usable feed entries");
    } catch (error) {
      console.warn("Feed failed",feed.id,String(error));
    }
  }
  return [];
}

async function articleMetadata(feed, url) {
  try {
    const result = await getDocument(url, candidate => Boolean(candidate && articleHost(feed,candidate)), 950000);
    const tags = new Map();
    const passages = new Map();
    // HTMLRewriter handles attribute order and HTML entity decoding.
    let jsonld = "";
    const graphs = [];
    const rewriter = new HTMLRewriter()
      .on('script[type="application/ld+json"]',{element(){ jsonld=""; },text(chunk){
        if(jsonld.length<150000) jsonld+=chunk.text;
        if(chunk.lastInTextNode) try {
          const values = JSON.parse(jsonld);
          for(const v of Array.isArray(values)?values:[values]) graphs.push(...(v?.["@graph"] || [v]));
        } catch {}
      }})
      .on("time[datetime]",{element(el){ if(!tags.has("time")) tags.set("time",el.getAttribute("datetime")); }})
      .on("meta", {element(element) {
        const key = (element.getAttribute("property") || element.getAttribute("name") || "").toLowerCase();
        const value = element.getAttribute("content");
        if (key && value && !tags.has(key)) tags.set(key,value);
      }})
      ;
    for (const selector of ["[itemprop='articleBody'] p",".entry-content p",".news-content p","article p",".article-content p",".news-detail p",".news-content",".article-body"]) {
      let buffer = "";
      rewriter.on(selector,{text(chunk) {
        if (buffer.length < 8500) buffer += chunk.text + (chunk.lastInTextNode ? " " : "");
        passages.set(selector,buffer);
      }});
    }
    await rewriter.transform(new Response(result.data,{headers:{"Content-Type":"text/html; charset=utf-8"}})).arrayBuffer();
    const headingEnd = result.data.search(/<\/h1\s*>/i);
    const articleFragment = headingEnd < 0 ? "" : result.data.slice(headingEnd+5).split(/<(?:aside|footer|nav)\b|<(?:h[2-6])[^>]*>\s*(?:related|latest|recommended)/i)[0];
    const bodyParagraphs = [...articleFragment.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(m=>plain(m[1])).filter(t=>t.length>50 && /[අ-ෆ]/u.test(t)).slice(0,12).join(" ");
    const nearbyDate = headingEnd<0 ? "" : plain(result.data.slice(Math.max(0,headingEnd-3500),headingEnd)).match(/\b\d{1,2} (?:January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d\b/i)?.[0];
    const paragraph = [...passages.values()].find(text => wordCount(text) >= 80) || [...passages.values()].sort((a,b)=>b.length-a.length)[0] || "";
    return {
      articleText:plain(graphs.find(v=>typeof v?.articleBody==="string")?.articleBody || paragraph || bodyParagraphs || tags.get("og:description") || "").slice(0,6500),
      date:graphs.find(v=>v?.datePublished)?.datePublished || tags.get("article:published_time") || tags.get("time") || (nearbyDate ? nearbyDate+" 00:00:00 GMT+0530" : ""),
      descriptions:[tags.get("og:description"),tags.get("description"),tags.get("twitter:description"),paragraph],
      image:publicUrl(tags.get("og:image:secure_url") || tags.get("og:image") || tags.get("twitter:image") || "",result.url),
      section:tags.get("article:section") || ""
    };
  } catch (error) {
    console.warn("Article metadata unavailable",feed.id,String(error));
    return null;
  }
}

const wordCount = text => text.trim().split(/\s+/u).filter(Boolean).length;
const newsLanguages = ["si", "en", "ta"];
const generatedOrigin = "https://summer-grass-0180ratawata-news-api.dilanthasiriwardana2.workers.dev";
const editorialTable = `CREATE TABLE IF NOT EXISTS editorial_media (
  article_id TEXT PRIMARY KEY,
  translations TEXT NOT NULL,
  image_base64 TEXT NOT NULL
)`;

function imageContentType(base64) {
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBORw0KGgo")) return "image/png";
  if (base64.startsWith("UklGR") && atob(base64.slice(0,16)).slice(8,12) === "WEBP") return "image/webp";
  return "";
}

async function commonsPhoto(subject, facts) {
  if (typeof subject !== "string" || subject.length < 3 || subject.length > 85 ||
      !facts.includes(subject) || !/[අ-ෆ]/u.test(subject)) return null;
  async function query(host, params) {
    const url = new URL("/w/api.php", "https://"+host);
    url.search = new URLSearchParams({action:"query",format:"json",formatversion:"2",...params});
    const response = await fetch(url,{signal:AbortSignal.timeout(4500),headers:{"User-Agent":"RataWata/1.0 (https://ratawata.online/contact/)"}});
    if (!response.ok) return null;
    return (await response.json()).query?.pages?.[0];
  }
  try {
    const page = await query("si.wikipedia.org",{titles:subject,prop:"pageimages",piprop:"name",pilicense:"free"});
    if (!page?.pageimage || !/\.jpe?g$/i.test(page.pageimage)) return null;
    const file = await query("commons.wikimedia.org",{titles:"File:"+page.pageimage,prop:"imageinfo",iiprop:"url|extmetadata|metadata",iiurlwidth:"960"});
    const info = file?.imageinfo?.[0], meta = info?.extmetadata;
    const license = meta?.LicenseShortName?.value || "";
    const credit = plain(meta?.Artist?.value || "");
    const terms = publicUrl(meta?.LicenseUrl?.value || "");
    const photo = publicUrl(info?.thumburl || info?.url || "");
    if (!photo || !isHost(photo,"upload.wikimedia.org") || !credit || credit.length>200 ||
        !terms || !isHost(terms,"creativecommons.org") || !/^(CC0|CC BY(?:-SA)? [\d.]+)$/i.test(license) ||
        !info.metadata?.some(field=>/^(Model|Make)$/i.test(field.name) && field.value)) return null;
    return {url:photo,credit:subject+" · "+credit+" · "+license,terms,file:info.descriptionurl};
  } catch { return null; }
}

function imageAllowed(env, source) {
  return String(env.LICENSED_IMAGE_SOURCES || "").split(",").map(value => value.trim()).includes(source);
}

async function fetchTrends() {
  try {
    const {data} = await getDocument(TRENDS_URL, url => isHost(url,"trends.google.com"), 550000);
    return [...data.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
      .slice(0,30).map(match => plain(getTag(match[1],"title"))).filter(Boolean);
  } catch (error) {
    console.warn("Trends unavailable",String(error));
    return [];
  }
}

async function ingest(env, feeds) {
  const sources = feeds === FEEDS.breaking ? [...feeds, ...FEEDS.normal] : feeds;
  const active = sources.filter(feed => !feed.permission || env[feed.permission] === "enabled");
  const batches = await Promise.all(active.map(fetchFeed));
  const breakingRun = feeds === FEEDS.breaking;
  const candidates = batches.flatMap((items,index) => items.map(item => {
    const feed = active[index];
    const breaking = feed.category === "weather" ||
      item.hints.some(hint => /^(?:breaking(?: news)?|හදිසි පුවත්|විශේෂ පුවත්)$/i.test(hint.trim()));
    return {...item,feed,breaking};
  })).filter(item => !breakingRun || item.breaking);
  const stats = {
    release: "rss-auto-1", mode: breakingRun ? "breaking" : "regular", aiBound: false,
    feeds: active.map((feed,index)=>({id:feed.id,items:batches[index].length})),
    candidates: candidates.length, ready: 0, insufficientFacts: 0, attempts: 0, prepared: 0, draftsSaved: 0, imagePending: 0
  };
  const finish = async changes => {
    await env.DB.prepare("CREATE TABLE IF NOT EXISTS rw_ingest_status (mode TEXT PRIMARY KEY, data TEXT NOT NULL)").run();
    await env.DB.prepare("INSERT INTO rw_ingest_status(mode,data) VALUES(?,?) ON CONFLICT(mode) DO UPDATE SET data=excluded.data")
      .bind(stats.mode,JSON.stringify({...stats,changes,finished:new Date().toISOString()})).run();
    console.info("RataWata ingestion summary", JSON.stringify({...stats, changes}));
    return changes;
  };
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS rw_report_drafts (id TEXT PRIMARY KEY, payload TEXT NOT NULL, retry_at INTEGER NOT NULL)").run();
  const now = Date.now();
  const queued = breakingRun ? [] : (await env.DB.prepare("SELECT id,payload FROM rw_report_drafts WHERE retry_at <= ? ORDER BY retry_at,id LIMIT 2").bind(now).all()).results;
  const saved = new Map(queued.map(row => [row.id, JSON.parse(row.payload)]));
  candidates.unshift(...queued.map(row => saved.get(row.id).item));
  if (!candidates.length) return finish(0);

  for (const item of candidates) {
    item.id = await sha256(item.feed.name + "|" + item.articleUrl);
    item.titleHash = await sha256(item.title.toLowerCase().trim());
  }
  await env.DB.prepare(editorialTable).run();
  const previous = new Map();
  for (let offset=0; offset<candidates.length; offset+=90) {
    const ids = candidates.slice(offset,offset+90).map(item=>item.id);
    const existing = await env.DB.prepare(
      "SELECT articles.id,articles.is_breaking,editorial_media.article_id AS ready FROM articles LEFT JOIN editorial_media ON editorial_media.article_id=articles.id WHERE articles.id IN ("+
      ids.map(()=>"?").join(",")+")"
    ).bind(...ids).all();
    for (const row of existing.results || []) previous.set(row.id,row);
  }
  const recent = await env.DB.prepare(
    "SELECT id,title,article_url FROM articles WHERE published_at >= ? ORDER BY published_at DESC LIMIT 400"
  ).bind(new Date(Date.now() - 72 * 3600000).toISOString()).all();
  const known = (recent.results || []).map(row => ({
    id: row.id, headline: normalized(row.title),
    link: /^https?:\/\//i.test(row.article_url) ? canonicalArticle(row.article_url) : ""
  }));
  const sriLankaNow = new Date(Date.now() + 330 * 60 * 1000);
  sriLankaNow.setUTCHours(0,0,0,0);
  const dayStart = new Date(sriLankaNow.getTime() - 330 * 60 * 1000).toISOString();
  const todayRow = await env.DB.prepare("SELECT COUNT(*) AS total FROM articles WHERE (CASE WHEN created_at > 100000000000 THEN CAST(created_at / 1000 AS INTEGER) ELSE created_at END) >= ?")
    .bind(Math.floor(Date.parse(dayStart) / 1000)).first();
  let postedToday = Number(todayRow?.total || 0);
  const statements = [];
  const seen = new Set();
  let lookups = 0;
  let rewrites = 0;
  // Rotate small batches so the same unavailable articles cannot block the feed.
  const pending = [...new Map(candidates.filter(item=>!previous.get(item.id)?.ready &&
    item.feed.category !== "weather").map(item=>[item.id,item])).values()];
  const batchSize = 5;
  const interval = breakingRun ? 5 : 30;
  const batchCount = Math.max(1,Math.ceil(pending.length/batchSize));
  const offset = (Math.floor(Date.now()/(interval*60000)) % batchCount) * batchSize;
  const eligibleIds = new Set(pending.slice(offset,offset+batchSize).map(item=>item.id));
  for (const item of candidates) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    const link = canonicalArticle(item.articleUrl);
    const titleKey = normalized(item.title);
    if (known.some(row => row.id !== item.id &&
      (row.link === link || sameHeadline(row.headline, titleKey)))) {
      if (saved.has(item.id)) statements.push(env.DB.prepare("DELETE FROM rw_report_drafts WHERE id=?").bind(item.id));
      continue;
    }
    const existing = previous.get(item.id);
    if (!existing && postedToday >= 15) continue;
    const officialAlert = item.feed.category === "weather";
    if (existing?.ready || (existing && officialAlert)) {
      if (saved.has(item.id)) statements.push(env.DB.prepare("DELETE FROM rw_report_drafts WHERE id=?").bind(item.id));
      stats.ready++;
      if (item.breaking && !existing.is_breaking) statements.push(env.DB.prepare(
        "UPDATE articles SET is_breaking=1 WHERE id=? AND is_breaking=0"
      ).bind(item.id));
      continue;
    }
    let description = item.description || "";
    let headline = item.title;
    let image = "";
    let category = classify(item.title,description,item.hints,item.feed.category);
    if (!officialAlert) {
      const metadata = (!item.imageUrl || !item.publishedAt || wordCount(item.feedText || "") < 120)
        ? await articleMetadata(item.feed,item.articleUrl) : null;
      if (!item.publishedAt) {
        const time = Date.parse(metadata?.date || "");
        if (!Number.isFinite(time) || time > Date.now() + 300000) continue;
        item.publishedAt = new Date(time).toISOString();
      }
      if (Date.parse(item.publishedAt) < Date.now() - 7 * 86400000) continue;
      if (metadata?.section) item.hints.push(metadata.section);
      const facts = [item.feedText,metadata?.articleText,item.description,...(metadata?.descriptions || [])]
        .filter(Boolean).reduce((best,text) => wordCount(text) > wordCount(best) ? text : best,"");
      description = summary(facts,item.title) || item.description || "";
      image = publicUrl(item.imageUrl || metadata?.image || "",item.articleUrl);
      stats.prepared++;
    }
    known.push({id:item.id,link,headline:titleKey});
    const tags = JSON.stringify(buildTags(headline,description,category));
    statements.push(env.DB.prepare(
      "INSERT INTO articles (id,title_hash,title,description,category,source,source_url,article_url,published_at,is_breaking,created_at,image_url,tags) " +
      "SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM articles WHERE (title_hash = ? OR article_url = ?) AND id <> ?) " +
      "ON CONFLICT(id) DO UPDATE SET title_hash=excluded.title_hash,title=excluded.title," +
      "description=CASE WHEN excluded.description='' THEN articles.description ELSE excluded.description END," +
      "category=excluded.category,is_breaking=MAX(articles.is_breaking,excluded.is_breaking)," +
      "image_url=excluded.image_url,tags=excluded.tags " +
      "WHERE articles.title<>excluded.title OR (excluded.description<>'' AND articles.description<>excluded.description) " +
      "OR articles.category<>excluded.category OR articles.is_breaking<excluded.is_breaking OR articles.image_url<>excluded.image_url OR articles.tags<>excluded.tags"
    ).bind(item.id,item.titleHash,headline,description,category,item.feed.name,item.feed.website,item.articleUrl,
      item.publishedAt,item.breaking ? 1 : 0,
      Math.floor(Date.now()/1000),image,tags,item.titleHash,item.articleUrl,item.id));
    if (!existing) postedToday++;
    if (!officialAlert) statements.push(env.DB.prepare("DELETE FROM rw_report_drafts WHERE id=?").bind(item.id));
  }
  if (!statements.length) return finish(0);
  const results = await env.DB.batch(statements);
  return finish(results.reduce((total,result) => total + (result.meta?.changes || 0),0));
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    }
  });
}
// API එකෙන් පුවත් ලබාගැනීම
async function getNews(env, url) {
  const requestedLimit = Number(url.searchParams.get("limit") || 50);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(Math.trunc(requestedLimit),1),100) : 50;
  const breaking = url.searchParams.get("breaking");
  const category = url.searchParams.get("category");
  let sql = `
    SELECT
      id, title, description, category, source,
      source_url, article_url, published_at,
      is_breaking, image_url, tags
    FROM articles
    WHERE 1 = 1
  `;
  const values = [];
  if (breaking === "1") {
    sql += " AND is_breaking = 1";
  }
  if (category) {
    sql += " AND category = ?";
    values.push(category);
  }
  const id = url.searchParams.get("id");
  if (id) {
    sql += " AND id = ?";
    values.push(id);
  }
  const lang = url.searchParams.get("lang");
  if (newsLanguages.includes(lang)) {
    await env.DB.prepare(editorialTable).run();
  }
  // Native Sinhala RSS entries do not need AI editorial records to appear.
  sql += " ORDER BY published_at DESC LIMIT ?";
  values.push(limit);
  const result = await env.DB.prepare(sql)
    .bind(...values)
    .all();
  const rows = result.results || [];
  const localized = new Map();
  const photoEditions = new Set();
  const credits = new Map();
  if (newsLanguages.includes(lang) && rows.length) {
    for (let offset=0; offset<rows.length; offset+=90) {
      const ids = rows.slice(offset,offset+90).map(row=>row.id);
      const bundle = await env.DB.prepare("SELECT article_id, translations FROM editorial_media WHERE article_id IN ("+
        ids.map(()=>"?").join(",")+")").bind(...ids).all();
      for (const row of bundle.results || []) {
        const data = JSON.parse(row.translations);
        localized.set(row.article_id,data[lang]);
        if (data._photo==="archive" && data._credit) credits.set(row.article_id,data._credit);
        if (["archive","studio"].includes(data._photo)) photoEditions.add(row.article_id);
      }
    }
  }
  const items = rows.map(item => {
    let tags = [];
    try {
      tags = JSON.parse(item.tags || "[]");
    } catch {
      tags = [];
    }
    const feed = [...FEEDS.normal,...FEEDS.breaking].find(source => source.name === item.source);
    const candidate = publicUrl(item.image_url || "");
    const generated = candidate === generatedOrigin + "/api/image/" + item.id;
    const credit=credits.get(item.id);
    const archive = candidate && credit?.url===candidate && isHost(candidate,"upload.wikimedia.org");
    const fallbackIndex = parseInt(item.id.slice(0,8),16) % 10;
    const fallback = generatedOrigin + "/api/fallback/" + fallbackIndex + ".svg";
    const image = archive || candidate === parliamentPhoto ? candidate : generated ? candidate :
      candidate && candidate !== SITE_LOGO ? candidate : fallback;
    return {
      id: item.id,
      title: localized.get(item.id)?.title || item.title,
      description: localized.get(item.id)?.report || item.description,
      word_count: wordCount(localized.get(item.id)?.report || item.description || ""),
      translated: Boolean(localized.get(item.id)),
      edition: photoEditions.has(item.id) ? "red-gold-1" : "legacy",
      generated_image: generated,
      category: item.category,
      category_si: CATEGORY_NAMES[item.category] || "දේශීය",
      source: item.source,
      source_url: item.source_url,
      original_url: item.article_url,
      published_at: item.published_at,
      breaking: Boolean(item.is_breaking),
      image,
      image_license:archive ? credit.terms : null,
      image_source:archive ? credit.file : null,
      image_label:
        archive ? "සංරක්ෂිත ඡායාරූපය · "+credit.credit : generated ? "AI නිර්මාණය කළ සංකේතාත්මක දසුන" : image !== SITE_LOGO
          ? isHost(image,"lankacnews.com") ? "Lanka C News" : "පුවත් මූලාශ්‍රයේ පින්තූරය"
          : candidate && candidate !== SITE_LOGO ? "පුවත් මූලාශ්‍රයේ පින්තූරය" : "RataWata සංකේතාත්මක රූපය",
      logo: SITE_LOGO,
      tags
    };
  });
  return {
    ok: true,
    count: items.length,
    logo: SITE_LOGO,
    items
  };
}
export default {
  async scheduled(event, env, ctx) {
    if (event.cron === "*/5 * * * *") ctx.waitUntil(ingest(env, FEEDS.breaking));
    if (event.cron === "*/30 * * * *") ctx.waitUntil(ingest(env, FEEDS.normal));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    try {
      if (path === "/api/status") {
        await env.DB.prepare("CREATE TABLE IF NOT EXISTS rw_ingest_status (mode TEXT PRIMARY KEY, data TEXT NOT NULL)").run();
        const status = await env.DB.prepare("SELECT data FROM rw_ingest_status ORDER BY mode").all();
        return json({ok:true,release:"rss-auto-1",runs:status.results.map(row=>JSON.parse(row.data))});
      }
      if (path === "/api/health") {
        return json({
          ok: true,
          service: "RataWata News API",
          release: "rss-auto-1",
          databaseBinding: "DB",
          reportGeneration: false,
          logo: SITE_LOGO,
          trends: TRENDS_URL,
          schedules: [
            "*/5 * * * *",
            "*/30 * * * *"
          ],
          feeds: [
            ...FEEDS.normal.map(feed => ({
              id: feed.id,
              name: feed.name,
              website: feed.website,
              feed: feed.url,
              category: feed.category,
              role: "normal-news",
              enabled: !feed.permission || env[feed.permission] === "enabled"
            })),
            ...FEEDS.breaking.map(feed => ({
              id: feed.id,
              name: feed.name,
              website: feed.website,
              feed: feed.url,
              category: feed.category,
              role: "breaking-alerts"
            }))
          ]
        });
      }
      const fallbackMatch = /^\/api\/fallback\/(\d)\.svg$/.exec(path);
      if (fallbackMatch) {
        const index = Number(fallbackMatch[1]);
        const palettes = [["#123b63","#2a8c9d"],["#542b62","#b15c87"],["#22543d","#68a879"],["#713f12","#d69a42"],["#263b72","#718bd5"],["#7f2938","#d66d78"],["#164e63","#38a6b8"],["#4a3b78","#a28bd4"],["#3f4b35","#a2b66c"],["#654321","#c18a55"]];
        const [a,b] = palettes[index];
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="960" height="540" fill="url(#g)"/><circle cx="${180+index*53}" cy="${145+index*17}" r="${210+index*5}" fill="#fff" opacity=".08"/><circle cx="${760-index*21}" cy="450" r="250" fill="#fff" opacity=".07"/><path d="M0 410 Q240 330 480 420 T960 390 V540 H0Z" fill="#071827" opacity=".22"/><g fill="none" stroke="#fff" stroke-width="12" opacity=".78"><rect x="350" y="150" width="260" height="205" rx="18"/><path d="M390 205h180M390 250h180M390 295h120"/></g><text x="480" y="455" fill="#fff" font-family="Arial,sans-serif" font-size="30" font-weight="700" text-anchor="middle" letter-spacing="5">RATAWATA NEWS</text></svg>`;
        return new Response(svg,{headers:{"Content-Type":"image/svg+xml; charset=utf-8","Cache-Control":"public, max-age=31536000, immutable","X-Content-Type-Options":"nosniff"}});
      }
      const imageId = /^\/api\/image\/([a-f0-9]{64})$/.exec(path)?.[1];
      if (imageId) {
        await env.DB.prepare(editorialTable).run();
        const row = await env.DB.prepare("SELECT image_base64 FROM editorial_media WHERE article_id=?").bind(imageId).first();
        if (!row?.image_base64) return new Response(null,{status:404});
        return new Response(Uint8Array.from(atob(row.image_base64),c=>c.charCodeAt(0)),{
          headers:{"content-type":imageContentType(row.image_base64) || "application/octet-stream","cache-control":"public,max-age=86400","x-content-type-options":"nosniff"}
        });
      }
      if (path === "/api/news") {
        const response = json(await getNews(env, url));
        response.headers.set("Cache-Control","public, max-age=30, stale-while-revalidate=120");
        return response;
      }
      if (path === "/api/trends") {
        return json({
          ok: true,
          trends: await fetchTrends()
        });
      }
      if (
        path === "/api/refresh" &&
        request.method === "GET"
      ) {
        if (!env.REFRESH_TOKEN || request.headers.get("Authorization") !== "Bearer " + env.REFRESH_TOKEN) {
          return json({ok:false,error:"Unauthorized"},401);
        }
        const normalCount = await ingest(env, FEEDS.normal);
        const breakingCount = await ingest(env, FEEDS.breaking);
        return json({
          ok: true,
          normalCount,
          breakingCount,
          message: "News refresh completed"
        });
      }
      return json({
        ok: false,
        error: "Not found"
      }, 404);
    } catch (error) {
      return json({
        ok: false,
        error: String(error)
      }, 500);
    }
  }
};