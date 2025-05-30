declare module 'cookie' {
  export function parse(str: string, options?: any): { [key: string]: string };
  export function serialize(
    name: string,
    value: string,
    options?: {
      maxAge?: number;
      domain?: string;
      path?: string;
      expires?: Date;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: boolean | 'lax' | 'strict' | 'none';
    },
  ): string;
}
