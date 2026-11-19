"use strict";
const el = id => document.getElementById(id);
const live = location.pathname.startsWith("/studio/");
const money = value => "BDT " + Number(value).toLocaleString("en-BD");
const products = [];
const history = [];
const prompts = ["Phones under BDT 40,000", "Galaxy A35 8/128 stock and warranty", "Delivery outside Dhaka"];
const queries = ["Which phones cost at most BDT 40000? Include prices and availability.", "Check the price, stock and warranty for the Samsung Galaxy A35 8/128 GB.", "My order is exactly BDT 20000. How much is delivery outside Dhaka and how long does it take?"];
function theme(value) {
  document.documentElement.dataset.theme = value;
  el("theme").textContent = value === "dark" ? "☀  Light theme" : "☾  Dark theme";
}
theme(localStorage.getItem("kinbo-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
el("theme").onclick = () => {
  theme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  localStorage.setItem("kinbo-theme", document.documentElement.dataset.theme);
};
function node(tag, text) {
  const item = document.createElement(tag);
  item.textContent = text;
  return item;
}
function message(author, body, calls = []) {
  const item = node("div", "");
  item.className = "message";
  item.append(node("strong", author), document.createTextNode(body));
  if (calls.length) {
    const trace = node("details", "");
    trace.append(node("summary", "Tool calls"), node("p", calls.join("\n")));
    item.append(trace);
  }
  el("messages").append(item);
  el("messages").scrollTop = el("messages").scrollHeight;
}
function drawCatalog() {
  const filtered = products.filter(p => !el("filter").value || p.category === el("filter").value);
  el("list").replaceChildren();
  el("count").textContent = filtered.length + " gadgets";
  for (const p of filtered) {
    const item = node("details", "");
    item.append(node("summary", p.name), node("div", money(p.price) + " · " + (p.stock > 0 ? "In stock" : "Out of stock")), node("p", p.description), node("p", "Warranty · " + p.warranty_months + " months"));
    el("list").append(item);
  }
}
async function loadCatalog() {
  if (!live) {
    const response = await fetch("./catalog.json");
    if (!response.ok) throw Error("Catalog unavailable");
    products.push(...await response.json());
  } else {
    let page = 1;
    while (true) {
      const response = await fetch("/api/v1/products?page_size=50&page=" + page++);
      if (!response.ok) throw Error("Catalog unavailable");
      const data = await response.json();
      products.push(...data.items);
      if (!data.items.length || products.length >= data.total) break;
    }
  }
  drawCatalog();
}
function example(index) {
  if (index === 2) return "Outside Dhaka delivery usually takes 4 working days. Delivery is free for this order because it reaches BDT 20,000.";
  if (index === 0) return products.filter(p => p.category === "phone" && p.price <= 40000).sort((a,b) => a.price-b.price).map(p => p.name + " · " + money(p.price) + (p.stock ? "" : " · out of stock")).join("\n");
  const p = products.find(p => p.slug === "samsung-galaxy-a35-8-128");
  return p.name + " costs " + money(p.price) + ". " + (p.stock ? "In stock" : "Out of stock") + " · " + p.warranty_months + "-month warranty.";
}
async function ask(content, index) {
  message("You", content);
  if (!live) { message("Kinbo · example", example(index)); return; }
  const buttons = [...el("examples").children, el("send")];
  buttons.forEach(button => button.disabled = true);
  el("send").textContent = "Asking…";
  try {
    const response = await fetch("/api/v1/chat", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({content, history:history.slice(-20)}), signal:AbortSignal.timeout(60000)});
    if (!response.ok) throw Error("Chat returned HTTP " + response.status);
    const data = await response.json();
    message("Kinbo", data.reply, data.tool_calls || []);
    history.push({role:"user",content}, {role:"assistant",content:data.reply});
    el("question").value = "";
  } catch (error) { message("Request failed", error.message + ". Please try again."); }
  finally { buttons.forEach(button => button.disabled = false); el("send").textContent = "Send ↗"; }
}
el("mode").textContent = live ? "Live API" : "Guided demo";
message("Kinbo", live ? "What are you shopping for? Ask me about a gadget, your budget, or a store policy." : "Choose an example to explore the seeded catalog and store policy. Replies here are preset.");
el("filter").onchange = drawCatalog;
el("chat").hidden = !live;
el("chat").onsubmit = event => {
  event.preventDefault();
  const content = el("question").value.trim();
  if (content && !el("send").disabled) ask(content);
};
loadCatalog().then(() => prompts.forEach((label, index) => {
  const button = node("button", label);
  button.onclick = () => ask(queries[index], index);
  el("examples").append(button);
})).catch(error => { el("list").textContent = "Could not load the catalog. Refresh to retry."; });
