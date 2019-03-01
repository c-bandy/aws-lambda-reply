import { isString, lowercaseKeys as lk } from './util';

export interface HttpHeaders {
  [key: string]: string | boolean | number;
}

export interface MultiValueHeaders { [key: string]: Array<string | boolean | number>; }

export interface LambdaReplyDefaults {
  headers: HttpHeaders;
  multiValueHeaders: MultiValueHeaders;
  isBase64Encoded: boolean;
}

export interface LambdaReplyOptions {
  headers?: HttpHeaders;
  multiValueHeaders?: MultiValueHeaders;
  isBase64Encoded?: boolean;
}

export interface LambdaResponseObject {
  statusCode: number;
  body: string;
  headers?: HttpHeaders;
  multiValueHeaders?: MultiValueHeaders;
  isBase64Encoded?: boolean;
}

export class LambdaReply {
  public defaults: LambdaReplyDefaults;

  /**
   * Creates a reply template with the selected options.
   *
   * @param defaults - Defaults to apply for each response made using this template.
   */
  constructor(defaults: Partial<LambdaReplyDefaults> = {}) {
    this.defaults = {
      headers: {
        'Content-Type': 'application/json',
        ...(defaults.headers || {}),
      },
      multiValueHeaders: (defaults.multiValueHeaders || {}),
      isBase64Encoded: defaults.isBase64Encoded || false,
    };
  }

  /**
   * Creates a response object from a template.
   *
   * @param statusCode - HTTP status code
   * @param body - The response body to return.
   * @param options - Customize the response. Overwrite headers or set the response as base64 encoded.
   * @param contentType - Set `Content-Type` header to this value.
   */
  public make(statusCode: number, body?: string, options?: LambdaReplyOptions): LambdaResponseObject;
  public make(statusCode: number, body?: string, contentType?: string): LambdaResponseObject;
  public make(statusCode: number, body: string = '', optionsLike?: LambdaReplyOptions | string):
  LambdaResponseObject {
    let options: LambdaReplyOptions;

    // Determine if third argument is content type, undefined, or options.
    if (isString(optionsLike)) {
      // Is a Content-Type header
      options = {
        headers: {
          'content-type': optionsLike as string,
        },
      };
    } else if (optionsLike instanceof Object) {
      // Is an options object.
      options = optionsLike as LambdaReplyOptions;
    } else {
      // Is unknown, set as empty.
      options = {};
    }

    return {
      statusCode,
      body,
      headers: {
        ...lk(this.defaults.headers), // set defaults
        ...lk(options.headers || {}), // spread specified headers
      },
      multiValueHeaders: {
        ...lk(this.defaults.multiValueHeaders),
        ...lk(options.multiValueHeaders || {}),
      },
      isBase64Encoded: options.isBase64Encoded !== undefined ? options.isBase64Encoded : this.defaults.isBase64Encoded,
    };
  }
}
