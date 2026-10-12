// Перед каждой сборкой убирает поле address у статей (@article) во всех .bib в posts/.
// Zotero подтягивает его из PubMed («United States», «England»), и оно попадает
// в список литературы как страна в скобках — в научных ссылках её не пишут.
// У книг address — это город издательства, его не трогаем.

function* bibFiles(dir: string): Generator<string> {
  for (const entry of Deno.readDirSync(dir)) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory) yield* bibFiles(path);
    else if (entry.name.endsWith(".bib")) yield path;
  }
}

for (const file of bibFiles("posts")) {
  const text = Deno.readTextFileSync(file);
  const removed: string[] = [];

  const cleaned = text
    .split(/(?=^@)/m)
    .map((entry) => {
      if (!/^@article\s*\{/i.test(entry)) return entry;
      return entry.replace(/^[ \t]*address[ \t]*=[ \t]*\{[^\n]*\},?[ \t]*\n/gim, (line) => {
        removed.push(line.trim());
        return "";
      });
    })
    .join("");

  if (removed.length) {
    Deno.writeTextFileSync(file, cleaned);
    console.log(`clean-bib: ${file} — убрано ${removed.length}: ${removed.join(" ")}`);
  }
}
