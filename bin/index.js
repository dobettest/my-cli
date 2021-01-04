#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const chalk = require("chalk");
const program = require("commander");
const extend = require("extend");
const echo = require("node-echo");
const { version } = require("../package.json");
const templates = require("../templates.json");
const ini = require("ini");
const { resolve } = require("path");
const TEMPLATERC = path.join(process.env.HOME, ".templaterc");
program.version(version);
program.command("ls").description(" List all the templates").action(onList);
program
  .command("add <name> <path>")
  .description("Add one custom template")
  .action(addTemplate);
program
  .command("del <name> <path>")
  .description("Remove one custom template")
  .action(removeTemplate);
program.command("init <name> <project>")
       .description("init project with template")
       .action(initTemplate);
program
  .command("help", { isDefault: false })
  .description("Print this help")
  .action(function () {
    program.outputHelp();
  });
program.parse(process.argv);

if (process.argv.length === 2) {
  program.outputHelp();
}
function onList() {
  let allTemplates = getAllTemplate();
  let info = ["Name"+"         "+"Path"+"        "+"Type"];
  Object.keys(allTemplates).forEach((t, k) => {
    let item = allTemplates[t];
    info.push(t + line(t, 12) + item["path"]+line(t,12)+item["type"]);
  });
  printMsg(info);
}
function getAllTemplate() {
  return extend({}, templates, getCustomTemplate());
}
function printMsg(infos) {
  infos.forEach(function (info) {
    console.log(info);
  });
}
function line(str, len) {
  var line = new Array(Math.max(1, len - str.length)).join("-");
  return " " + line + " ";
}
function addTemplate(name, path) {
  let customTemplate = getCustomTemplate(() => {
    console.log("customBefore");
  });
  if (customTemplate.hasOwnProperty(name)) {
    console.log(chalk.red(`${name} is exist`));
    return;
  }
  let template = (customTemplate[name] = {});
  template[path] = path;
  template[type]=(/^http(s)?:\/\/(\S+).git$/).test(path)?"git":"local"
  setCustomTemplate(customTemplate, (err) => {
    if (err) {
      exit(err);
    }
    printMsg(["", "    add template " + name + " success", ""]);
  });
}
function removeTemplate(name) {
  let customTemplate = getCustomTemplate();
  if (!customTemplate.hasOwnProperty(name)) {
    return;
  }
  delete customTemplate[name];
  setCustomTemplate(customTemplate, (err) => {
    if (err) {
      exit(err);
    }
    printMsg[("", "    remove template " + name + " success", "")];
  });
}
function printErr(err) {
  console.error("an error occured: " + err);
}
function exit(err) {
  printErr(err);
  process.exit(1);
}
function getCustomTemplate(cbk) {
  cbk && typeof cbk === "function" ? cbk() : "";
  return fs.existsSync(TEMPLATERC)
    ? ini.parse(fs.readFileSync(TEMPLATERC, "utf-8"))
    : {};
}
function setCustomTemplate(config, cbk) {
  echo(ini.stringify(config), ">", TEMPLATERC, cbk);
}
function initTemplate(name,projectName){
  let allTemplate=getAllTemplate();
  if(!allTemplate.hasOwnProperty(name)){
    exit("the template is not found");
  }
  let template=allTemplate[name];
  let targetPath=path.resolve(process.cwd(),projectName);
  if(fs.existsSync(targetPath)){
    exit(projectName+" already exist in "+targetPath);
  }
    if(template["type"]==="git"){
      exec("git clone "+template["path"],(err)=>{
        if(err){
          exit(err);
        }
        fs.renameSync(name,projectName,(err)=>{
          if(err){
            exec("rm -drf "+name,(err,stdout)=>{});
          }
        })
      })
    }
    else if(template["type"]==="local"){
      exec("cp -r "+template["path"]+" "+projectName,(err)=>{
        if(err){
          exit(err);
        }
        fs.renameSync(name,projectName,(err)=>{
          if(err){
            exec("rm -drf "+name,(err,stdout)=>{});
          }
        })
      })
    }
}
