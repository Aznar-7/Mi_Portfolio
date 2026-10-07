import {
  SiReact, SiReactHex,
  SiVite, SiViteHex,
  SiDjango, SiDjangoHex,
  SiPostgresql, SiPostgresqlHex,
  SiNginx, SiNginxHex,
  SiPython, SiPythonHex,
  SiTailwindcss, SiTailwindcssHex,
  SiSqlite, SiSqliteHex,
  SiCplusplus, SiCplusplusHex,
  SiFlask, SiFlaskHex,
  SiRaspberrypi, SiRaspberrypiHex,
  SiJavascript, SiJavascriptHex,
  SiNodedotjs, SiNodedotjsHex,
  SiExpress, SiExpressHex,
  SiArduino, SiArduinoHex,
  SiEspressif, SiEspressifHex,
  SiLinux, SiLinuxHex,
  SiHtml5, SiHtml5Hex,
  SiCss, SiCssHex,
  SiOpenjdk, SiOpenjdkHex,
  SiSpring, SiSpringHex,
  SiGit, SiGitHex,
  SiDocker, SiDockerHex,
  SiVercel, SiVercelHex,
  SiJira, SiJiraHex,
  SiMysql, SiMysqlHex,
  SiHaskell, SiHaskellHex,
  SiRender, SiRenderHex,
} from '@icons-pack/react-simple-icons'

const ICONS = {
  'React': [SiReact, SiReactHex],
  'React Native': [SiReact, SiReactHex],
  'Vite': [SiVite, SiViteHex],
  'Django': [SiDjango, SiDjangoHex],
  'PostgreSQL': [SiPostgresql, SiPostgresqlHex],
  'Nginx': [SiNginx, SiNginxHex],
  'Python': [SiPython, SiPythonHex],
  'Tailwind CSS': [SiTailwindcss, SiTailwindcssHex],
  'SQLite': [SiSqlite, SiSqliteHex],
  'C/C++': [SiCplusplus, SiCplusplusHex],
  'Flask': [SiFlask, SiFlaskHex],
  'Raspberry Pi': [SiRaspberrypi, SiRaspberrypiHex],
  'JavaScript': [SiJavascript, SiJavascriptHex],
  'Node.js': [SiNodedotjs, SiNodedotjsHex],
  'Express': [SiExpress, SiExpressHex],
  'Arduino': [SiArduino, SiArduinoHex],
  'ESP32': [SiEspressif, SiEspressifHex],
  'Linux': [SiLinux, SiLinuxHex],
  'HTML': [SiHtml5, SiHtml5Hex],
  'CSS': [SiCss, SiCssHex],
  'Java': [SiOpenjdk, SiOpenjdkHex],
  'Spring': [SiSpring, SiSpringHex],
  'Git': [SiGit, SiGitHex],
  'Docker': [SiDocker, SiDockerHex],
  'Vercel': [SiVercel, SiVercelHex],
  'Render': [SiRender, SiRenderHex],
  'Jira': [SiJira, SiJiraHex],
  'MySQL': [SiMysql, SiMysqlHex],
  'Haskell': [SiHaskell, SiHaskellHex],
}

// Near-black brand colors would vanish on the dark UI; use the text color instead
function readable(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 60 ? '#ededf2' : hex
}

// Brand marks keyed by the tech name used in data files: { Icon, brand }.
// Names without an entry render as text only.
export const TECH_ICONS = Object.fromEntries(
  Object.entries(ICONS).map(([name, [Icon, hex]]) => [name, { Icon, brand: readable(hex) }]),
)
