export interface Schema {
  name: string;
  path?: string;
  project?: string;
  module?: string;
  flat?: boolean;
  spec?: boolean;
  lintFix?: boolean;
  items?: boolean;
}
