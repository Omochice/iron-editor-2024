export function extractParticipante(lines: readonly string[]): string[] {
  const k = "参加者 ";
  return lines.filter((line) => line.includes(k))
    .map((line) => line.substring(line.indexOf(k) + k.length));
}

if (import.meta.main) {
  const lines = Deno.readTextFileSync(Deno.args[0]).split(/\r?\n/);
  console.log(extractParticipante(lines).join("\n"));
}
