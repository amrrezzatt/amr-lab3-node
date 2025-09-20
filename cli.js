import { Command } from "commander";
import fs from "fs/promises";

const program = new Command();
const file = "./users.json";

async function getData() {
  const data = await fs.readFile(file, "utf-8");
  return JSON.parse(data);
}

async function save(data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

program
  .command("add")
  .argument("<name>")
  .action(async (name) => {
    const data = await getData();
    data.push({ id: Date.now(), Name: name });
    await save(data);
    console.log("User added");
  });

program
  .command("remove")
  .argument("<id>")
  .action(async (id) => {
    const data = await getData();
    const i = data.findIndex((u) => u.id === +id);
    if (i < 0) return console.log("User not found");
    data.splice(i, 1);
    await save(data);
    console.log("User removed");
  });

program
  .command("getall")
  .action(async () => {
    const data = await getData();
    data.forEach((u) => console.log(`ID: ${u.id} | Name: ${u.Name}`));
  });

program
  .command("getone")
  .argument("<id>")
  .action(async (id) => {
    const data = await getData();
    const user = data.find((u) => u.id === +id);
    if (!user) return console.log("User not found");
    console.log(`ID: ${user.id} | Name: ${user.Name}`);
  });

program
  .command("edit")
  .argument("<id>")
  .argument("<name>")
  .action(async (id, name) => {
    const data = await getData();
    const user = data.find((u) => u.id === +id);
    if (!user) return console.log("User not found");
    user.Name = name;
    await save(data);
    console.log("User updated");
  });

program.parse();
