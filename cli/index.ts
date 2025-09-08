const helpMessage = `
Liga Korupsi CLI - Help
---------------------------

Usage: bun cli <command> [options]

Available Commands:

  get <entity> <id>
    Description: Fetches details for a single entry from the database.
    Usage:
      bun cli get kasus <id>
      bun cli get pihak <id>
      bun cli get berita <id>

  list <entity> [id]
    Description: Lists all entries for a given entity from the database.
    Usage:
      bun cli list kasus
      bun cli list pihak
      bun cli list berita
      bun cli list kasus_timeline <kasus_id>
      bun cli list pihak_timeline <pihak_id>
      bun cli list berita_kasus <kasus_id>

  post <entity> [args]
    Description: Adds new data to the database.
    Usage:
      bun cli post kasus <kasus> <tahun> <nilai> [daerah]
      bun cli post pihak <nama> <kasus_id>
      bun cli post berita <kasus_id> <judul> <url>
      bun cli post kasus_timeline <kasus_id> <tanggal> <deskripsi>
      bun cli post pihak_timeline <pihak_id> <tanggal> <deskripsi>

  update <entity> [args]
    Description: Updates existing data in the database.
    Usage:
      bun cli update berita <berita_id> <new_url>
      bun cli update berita_judul <berita_id> <new_judul>
      bun cli update pihak_nama <pihak_id> <new_nama>
      bun cli update pihak_timeline_deskripsi <timeline_id> <new_deskripsi>
      bun cli update pihak_timeline_url <timeline_id> <new_url>

  update-inflation [id]
    Description: Calculates and updates the 'nilai_inflasi' column in the 'kasus' table based on historical inflation data. If an ID is provided, only that specific record will be updated.
    Usage: 
      bun cli update-inflation
      bun cli update-inflation <id>

  clean-link <url>
    Description: Attempts to clean a given URL, resolving Vertex AI redirects.
    Usage:
      bun cli clean-link <url>

  delete <entity> <id>
    Description: Deletes data from the database.
    Usage:
      bun cli delete kasus <id>
      bun cli delete pihak <id>
      bun cli delete pihak_timeline <pihak_id>
      bun cli delete pihak_timeline_entry <timeline_id>

  help, --help
    Description: Shows this help message.
    Usage: bun cli help

`;

const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

// Handle no command or help command
if (command === undefined || command === 'help' || command === '--help') {
    console.log(helpMessage);
} else {
    switch (command) {
    case 'get':
        Bun.spawnSync(['bun', 'run', 'cli/get.ts', ...commandArgs], {
            stdout: 'inherit',
            stderr: 'inherit'
        });
        break;
    case 'post':
        Bun.spawnSync(['bun', 'run', 'cli/post.ts', ...commandArgs], {
            stdout: 'inherit',
            stderr: 'inherit'
        });
        break;
    case 'update':
        Bun.spawnSync(['bun', 'run', 'cli/update.ts', ...commandArgs], {
            stdout: 'inherit',
            stderr: 'inherit'
        });
        break;
    case 'update-inflation':
        Bun.spawnSync(['bun', 'run', 'cli/update-inflation.ts', ...commandArgs], {
            stdout: 'inherit',
            stderr: 'inherit'
        });
        break;
    case 'delete':
        Bun.spawnSync(['bun', 'run', 'cli/delete.ts', ...commandArgs], {
            stdout: 'inherit',
            stderr: 'inherit'
        });
        break;
    case 'list':
        Bun.spawnSync(['bun', 'run', 'cli/list.ts', ...commandArgs], {
            stdout: 'inherit',
            stderr: 'inherit'
        });
        break;
    case 'clean-link':
        Bun.spawnSync(['bun', 'run', 'cli/clean-link.ts', ...commandArgs], {
            stdout: 'inherit',
            stderr: 'inherit'
        });
        break;
    case 'help':
    case '--help':
        console.log(helpMessage);
        break;
    default:
        console.log(`Unknown command: ${command}`);
        console.log("Run 'bun cli help' to see available commands.");
        break;
}
}