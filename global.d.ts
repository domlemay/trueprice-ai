// CSS side-effect imports (required for TypeScript 5.5+)
declare module "*.css";
declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}
