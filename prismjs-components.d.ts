declare module 'prismjs/components/prism-core.js' {
  import Prism from 'prismjs'
  export default Prism
}

declare module 'prismjs/components/*.js' {
  const value: unknown
  export default value
}
