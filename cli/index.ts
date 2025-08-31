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

  list <entity>
    Description: Lists all entries for a given entity from the database.
    Usage:
      bun cli list kasus
      bun cli list pihak
      bun cli list berita

  post <entity> [args]
    Description: Adds new data to the database.
    Usage:
      bun cli post kasus <kasus> <tahun> <nilai> [daerah]
      bun cli post pihak <nama> <kasus_id>
      bun cli post berita <kasus_id> <judul> <url>

  update <entity> [args]
    Description: Updates existing data in the database.
    Usage:
      bun cli update berita <berita_id> <new_url>

  delete <entity> <id>
    Description: Deletes data from the database.
    Usage:
      bun cli delete kasus <id>

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