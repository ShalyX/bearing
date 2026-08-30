const base = process.env.SMOKE_URL || "http://127.0.0.1:3017";
const checks = [
  ["health", "/api/health", 200],
  ["ready", "/api/ready", 200],
  ["marketplace", "/marketplace", 200],
  ["agent profile", "/agents/pancake-position-keeper", 200],
];

for (const [name, path, expected] of checks) {
  const response = await fetch(`${base}${path}`, { redirect: "manual" });
  const body = await response.text();
  if (response.status !== expected) throw new Error(`${name}: expected ${expected}, got ${response.status}`);
  if (!body) throw new Error(`${name}: empty response`);
  console.log(`${name}: ${response.status}`);
}
console.log("smoke: passed");
