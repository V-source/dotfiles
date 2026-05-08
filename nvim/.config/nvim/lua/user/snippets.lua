local ls = require "luasnip"
local s = ls.snippet
local sn = ls.snippet_node
local isn = ls.indent_snippet_node
local t = ls.text_node
local i = ls.insert_node
local f = ls.function_node
local c = ls.choice_node
local d = ls.dynamic_node
local r = ls.restore_node
local events = require("luasnip.util.events")
local ai = require("luasnip.nodes.absolute_indexer")
local fmt = require("luasnip.extras.fmt").fmt
local extras = require("luasnip.extras")
local rep = extras.rep
local m = require("luasnip.extras").m
local l = require("luasnip.extras").l
local postfix = require("luasnip.extras.postfix").postfix

-- Función para formatear el contenido del snippet
ls.filetype_extend('javascriptreact', { "typescriptreact", "typescript" })

ls.add_snippets('all', {
  s("// _c", fmt([[
 // _c ::> {text}
  ]], { text = i(0) }))
})

ls.add_snippets("javascript", {
  -- ╭─────────────────────────────────────────────────────────╮
  -- │ FORM VALIDATORS                                         │
  -- ╰─────────────────────────────────────────────────────────╯
  s("validators", fmt([[
export function isEmpty(arg) {{ return arg === ""}}

export function isEmail(arg) {{
  const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{{2,4}}$/
  return regexEmail.test(arg)
}}

export function isPassword(arg) {{
  const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&#.$($)$-$_])[A-Za-z\d$@$!%*?&#.$($)$-$_]{{8,15}}$/;
  return regexPassword.test(arg)
}}
  ]], {})),

  --   ──────────────────────────────────────────────────────────────────────
  -- ╭─────────────────────────────────────────────────────────╮
  -- │ MONGODB CONNECTION                                      │
  -- ╰─────────────────────────────────────────────────────────╯
  s("mongodb", fmt([[
import {{ connect }} from "mongoose";

async function initDb() {{
    console.log("conectando con la base de dato. por favor espere");
    try {{
      const db = await connect("mongodb://127.0.0.1:27017/{dbname}", {{
        serverSelectionTimeoutMS: 30000,
      }});

      console.log(`conectado a la base de datos: ${{db.connection.name}}`);

    }} catch (error) {{
      console.log("ha ocurrido un error inesperado, vuelva a intentarlo");
      console.log(error);
    }}
  }}

export default initDb;
  ]], { dbname = i(0) })),

  --   ──────────────────────────────────────────────────────────────────────
  -- ╭─────────────────────────────────────────────────────────╮
  -- │ ELECTRON INITAL CONF                                    │
  -- ╰─────────────────────────────────────────────────────────╯
  s("electron", fmt([[
const {{app, BrowserWindow}} = requier('electron')

app.disableHardwareAcceleration()
app.enableSandbox()

const isSingleInstance = app.requestSingleInstanceLock()

if(!isSingleInstance) {{
  app.quit()
  process.exit(0)
}}

let mainwindow = null

app.on('ready', async () => {{
  console.log('electron is running')

  mainwindow = new BrowserWindow({{
    show: false,
  }})

  mainwindow.on('ready-to-show', () => {{
    mainwindow.show()
  }})

  await mainwindow.{a}

}})


app.on('window-all-closed', () => {{
  if(process.platform !== 'darwin') app.quit()
}})


app.on('second-instance', () => {{
  if(mainwindow) {{
    if(mainwindow.isMinimized()) {{
      mainwindow.restore()
    }} else {{
      mainwindow.focus()

    }}
  }}
}})
  ]], { a = i(0) })),

  --  ── MONGO QUERYS ────────────────────────────────────────────────────
  s("findOne: Custom Mongo query", fmt([[
async function findOne(Schema, obj) {{
 try {{
    const data = await Schema.findOne(obj);
    if (!data) {{
      throw new Error('No existe el registro');
    }}
    return {{data: data}};
 }} catch (error) {{
    return {{error: error}};
 }}
}}
  ]],
    {}
  )),
  s('log', fmt([[
  console.log({d})
]], { d = i(0) })),

  --  ── MONGO FEEDER ────────────────────────────────────────────────────
  s("db feeder", fmt(
    [[

export const userFeeder = async () => {{
  adminSeed.map(async (e) => feeder({SchemaName}, e))
}};

async function feeder(Schema, seed) {{
    try {{
      const existsUser = await Schema.findOne({{ email: seed.email }});
      if (!existsUser) {{
        {logic}
        }}

        const user = await newUser.save();
        return user;
      }}
    }} catch (error) {{
    if(error.name == 'ValidationError'){{
      return console.error(error.message)
    }}
      console.error(`Error al crea nuevo socio de prueba: ${{error.message}}`);
      throw error;
    }}
}}
   ]],
    { SchemaName = i(1), logic = i(0) }
  )),

  --  ── TOKEN CREATOR ───────────────────────────────────────────────────
  s("create token", fmt(
    [[
      import jwt from 'jsonwebtoken';

      const tsk = process.env.TOKEN_SECRET;


      export function createToken(id) {{
        const token = jwt.sign({{userId: id}}, tsk, {{expiresIn: '18h'}})
        return token
      }}
    ]],
    {}
  )),

  --  ── TERNARY ─────────────────────────────────────────────────────────
  s("ternary", {
    -- equivalent to "${1:cond} ? ${2:then} : ${3:else}"
    i(1, "cond"), t(" ? "), i(2, "then"), t(" : "), i(3, "else")
  }),

  --  ── ARROW FUNCIONT ──────────────────────────────────────────────────
  --[[ s("arf", {
    t("("), i(1), t(") => "), i(0, "body")
  }), ]]

  s('arf', fmt([[
    ({param}) => {{{logic}}}
  ]], { param = i(1), logic = i(0) })),

  --  ── ASYNC ARROW FUNCTION ────────────────────────────────────────────
  s("async arf", {
    t("async ()"), t({ " => {", "\t" }), i(0, "logic"), t { "", "}" }
  }),

  --  ── ASYNC FUNCTION ──────────────────────────────────────────────────
  s("async func", {
    t("async function "),
    i(1, "fun_name"),
    t("("), i(2, "params"),
    t(")"),
    t({ " {", "\t" }),
    i(0, "logic"), t { "", "}" }
  }),

  --  ── TRY CATCH ───────────────────────────────────────────────────────
  s("try", {
    t({ "try{ ", "\t" }),
    i(0),
    t({ "", "} catch(error) {", "\t" }),
    t({ "", "}" }),
  }),
})
-- ──────────────────────────────────────────────────────────────────────
-- ╭─────────────────────────────────────────────────────────╮
-- │ REACT SNIPPETS                                          │
-- ╰─────────────────────────────────────────────────────────╯
ls.add_snippets("javascriptreact", {
  s("useFethc", fmt([[
import {{ useState, useEffect }} from "react";

export const useFetch = (url, opts) => {{
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {{
    const fetchData = async () => {{
      setIsPending(true);
      try {{
        const response = await fetch(url, opts);
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        setIsPending(false);
        setData(json);
        setError(null);
      }} catch (error) {{
        setError(`${{error}} Ocurrión un error inesperado `);
        setIsPending(false);
      }}
    }};
    fetchData();
  }}, [url]);
  return {{ data, isPending, error }};
}};
  ]], {})),
  --  ── REACT FUNCTIONAL COMPONENT ──────────────────────────────────────
  s("sfc", fmt([[
  function {a}() {{
    return(
    {b}
    )
  }}
  export default {a}
  ]],
    { a = i(1), b = i(2) },
    { repeat_duplicates = true }
  )),





  --  ── COMPONENT AUTO CLOSE ────────────────────────────────────────────
  s("comp", fmt(
    [[
    <{componentname} />
    ]],
    { componentname = i(0) }
  )),
  --  ── COMPONENT CLOSE TAG ─────────────────────────────────────────────
  s("comp1", fmt(
    [[
    <{componentname} >
    </{componentname}>
    ]],
    { componentname = i(0) },
    { repeat_duplicates = true }
  )),
  --  ── REACT NATIVE FUNCTIONAL COMPONENT ───────────────────────────────
  s('rnfc', fmt(
    [[
    import {{ View, Text, StyleSheet }} from 'react-native'
    export default function {a}() {{
      return(
        {b}
      )
    }}
    ]]
    , { a = i(1), b = i(0) }
  ))
})

-- ╭─────────────────────────────────────────────────────────╮
-- │ JAVASCRIPT SNIPPETS                                     │
-- ╰─────────────────────────────────────────────────────────╯
ls.add_snippets("javascript", {
  --  ── EXPRESS METHOD ──────────────────────────────────────────────────
  s("expressMethod", fmt(
    [[
    {method}('{url}', {async} (req, res) => {{
      res.json({{msg: '{response}'}})
    }})
  ]],
    { method = i(1), url = i(2), async = i(3), response = i(0) }
  )),
  --  ── EXPRESS ROUTER ──────────────────────────────────────────────────
  s("expressRouter", fmt(
    [[
    import {{ Router }} from 'express'

    const {routerName} = Router()

    {routerName}
      .{method}('{url}', {async} (req, res) => {{
        res.json({{msg: '{response}'}})
      }})


    export default {routerName}
    ]],
    { routerName = i(1), method = i(2), url = i(3), async = i(4), response = i(0) },
    { repeat_duplicates = true }
  )),
  --  ── MONGOOSE SCHEMA ─────────────────────────────────────────────────
  s("schema", fmt(
    [[
    {import}


    const {schemaName}Schema = new Schema(
      {{
        {props}
      }},
      {{
        timestamps: true,
        versionKey: false,
      }},
    );


    export const {schemaName}Model = model("{schemaName}", {schemaName}Schema)
    ]],
    { import = i(1, 'import { Schema, model } from "mongoose"'), schemaName = i(2), props = i(0), --[[ modelName = i(2) ]] },
    { repeat_duplicates = true }
  )),

  s("export const", fmt(
    [[
      export const {constname} = async ({params}) => {{{logic}}}
    ]],
    { constname = i(1), params = i(2), logic = i(0) }
  )),


})

-- ╭─────────────────────────────────────────────────────────╮
-- │ ASTRO SNIPPETS                                          │
-- ╰─────────────────────────────────────────────────────────╯
ls.add_snippets("astro", {
  s('import', fmt(
    [[
    import {functionality} from '{module}'
    ]],
    { functionality = i(1), module = i(0) }
  ))
})
-- ╭─────────────────────────────────────────────────────────╮
-- │                        MARKDOWN                         │
-- ╰─────────────────────────────────────────────────────────╯
ls.add_snippets("all", {
  s('icon idea 🗲', fmt([[🗲 {title}]], { title = i(0) })),

  s('icon goal 🎯', fmt([[🎯 {title}]], { title = i(0) })),

  s('icon tasks ⛬ ', fmt([[⛬ {title}]], { title = i(0) })),

  s('icon warn ⚠️', fmt([[⚠️ {title}]], { title = i(0) })),

  s('icon note 🖉', fmt([[🖉 {title}]], { title = i(0) })),

  s('icon clock ⏲ ', fmt([[⏲  {title}]], { title = i(0) })),

  s('icon bug 󰨰 ', fmt([[󰨰 {title}]], { title = i(0) })),

  s('icon quote 󱆨 ', fmt([[󱆨 {title} ]], { title = i(0) })),

  s('icon vertLine ┃ ', fmt([[┃ {title}]], { title = i(0) })),
  
  s('icon hammer ┃ ', fmt([[🔨 {title}]], { title = i(0) })),

  s('icon start ✪ ', fmt([[✪ {title}]], { title = i(0) })),

  s('icon tag 🏷 ', fmt([[🏷 {title}]], { title = i(0) })),

  s('face neutral 😐 ', fmt([[😐 {title}]], { title = i(0) })),

  s('face melting 🫠 ', fmt([[🫠 {title}]], { title = i(0) })),

  s('face thinking 🤔 ', fmt([[🤔 {title}]], { title = i(0) })),

  s('face nice 😎', fmt([[😎 {title}]], { title = i(0) })),

  s('icon feat new 🚀', fmt([[🚀 Feat: {title}]], { title = i(0) })),
  s('icon initial setup ✨', fmt([[✨ Init: {title}]], { title = i(0) })),
  s('icon wip working 🚧', fmt([[🚧 WIP: {title}]], { title = i(0) })),
  s('icon refactor 🔨', fmt([[🔨 Refactor: {title}]], { title = i(0) })),
  s('icon style css 🎨', fmt([[🎨 Style: {title}]], { title = i(0) })),
  s('icon fix bug 🐛', fmt([[🐛 Fix: {title}]], { title = i(0) })),
  s('icon hotfix fire 🔥', fmt([[🔥 Hotfix: {title}]], { title = i(0) })),
  s('icon revert back ⏪', fmt([[⏪ Revert: {title}]], { title = i(0) })),
  s('icon docs book 📖', fmt([[📖 Docs: {title}]], { title = i(0) })),
  s('icon assets image 🖼️', fmt([[🖼️ Assets: {title}]], { title = i(0) })),
  s('icon texts speech 💬', fmt([[💬 Texts: {title}]], { title = i(0) })),
  s('icon build tools 🛠️', fmt([[🛠️ Build: {title}]], { title = i(0) })),
  s('icon ci cd ⚙️', fmt([[⚙️ CI/CD: {title}]], { title = i(0) })),
  s('icon deps packages 📦', fmt([[📦 Deps: {title}]], { title = i(0) })),
  s('icon test check ✅', fmt([[✅ Test: {title}]], { title = i(0) })),
  s('icon security lock 🔒', fmt([[🔒 Security: {title}]], { title = i(0) })),
  s('icon perf speed ⚡', fmt([[⚡ Perf: {title}]], { title = i(0) })),
  s('icon test 🧪', fmt([[🧪 {title}]], { title = i(0) })),
  s('icon priority 1', fmt([[#_priority:1 {title}]], { title = i(0) })),
  s('icon priority 2', fmt([[#_priority:2 {title}]], { title = i(0) })),
  s('icon priority 3', fmt([[#_priority:3 {title}]], { title = i(0) })),
  s('icon priority 4', fmt([[#_priority:4 {title}]], { title = i(0) })),

})

ls.add_snippets("markdown", {
  s('indice', fmt([[
  # INDICE
  ▰▰▰▰▰▰▰▰▰▰▰
  ]], {}))
})
