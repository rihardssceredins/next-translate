import { clearCommentsRgx } from './constants'

export default function templateWithHoc(
  code,
  {
    skipInitialProps = false,
    typescript,
    pageName = '__Page_Next_Translate__',
  } = {}
) {
  const tokenToReplace = `__CODE_TOKEN_${Date.now().toString(16)}__`
  const codeWithoutComments = code.replace(clearCommentsRgx, '')
  const locales = process.cwd() + '/locales/${l}/${n}'

  // Replacing all the possible "export default" (if there are comments
  // can be possible to have more than one)
  let modifiedCode = code.replace(/export +default/g, `const ${pageName} =`)

  // It is necessary to change the name of the page that uses getInitialProps
  // to ours, this way we avoid issues.
  const [, , componentName] =
    codeWithoutComments.match(
      /export +default +(function|class) +([A-Z]\w*)/
    ) || []

  if (componentName) {
    modifiedCode = modifiedCode.replace(
      new RegExp(`\\W${componentName}\\.getInitialProps`, 'g'),
      `${pageName}.getInitialProps`
    )
  }

  let template = `
    import __i18nConfig from '${process.cwd() + '/i18n'}'
    import __appWithI18n from 'next-translate/appWithI18n'
    ${tokenToReplace}
    export default __appWithI18n(__Page_Next_Translate__, {
      ...__i18nConfig,
      isLoader: true,
      skipInitialProps: ${skipInitialProps},
      defaultLoader: (l, n) => import(\`${locales}\`)
        .then(m => m.default)
    });
  `

  if (typescript) template = template.replace(/\n/g, '\n// @ts-ignore\n')

  return template.replace(tokenToReplace, `\n${modifiedCode}\n`)
}
