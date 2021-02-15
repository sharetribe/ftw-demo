const http = require('http');
const https = require('https');
const sharetribeSdk = require('sharetribe-flex-sdk');
const Decimal = require('decimal.js');
const sdkUtils = require('../api-util/sdk');

const BASE_URL = process.env.REACT_APP_SHARETRIBE_SDK_BASE_URL;
const TRANSIT_VERBOSE = process.env.REACT_APP_SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true';
const USING_SSL = process.env.REACT_APP_SHARETRIBE_USING_SSL === 'true';

// redirect_uri param used when initiating a login as authentication flow and
// when requesting a token using an authorization code
const loginAsRedirectUri = rootUrl => `${rootUrl.replace(/\/$/, '')}/api/login-as`;

// Instantiate HTTP(S) Agents with keepAlive set to true.
// This will reduce the request time for consecutive requests by
// reusing the existing TCP connection, thus eliminating the time used
// for setting up new TCP connections.
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

// Cookies used for authorization code authentication.
const stateKey = clientId => `st-${clientId}-oauth2State`;
const codeVerifierKey = clientId => `st-${clientId}-pkceCodeVerifier`;

/**
 * Makes a base64 string URL friendly by
 * replacing unaccepted characters.
 */
const urlifyBase64 = base64Str =>
  base64Str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

const hostnameToClientId = hostname => {
  // Match the first sub domain for an UUID in form:
  // 00000000-0000-0000-0000-000000000000.another-sub-domain.example.com
  const match = /^(\w{8}-\w{4}-\w{4}-\w{4}-\w{12})\./.exec(hostname);
  return match ? match[1] : null;
};

// Works as the redirect_uri passed in an authorization code request. Receives
// an authorization code and uses that to log in and redirect to the landing
// page.
// Works as the redirect_uri passed in an authorization code request. Receives
// an authorization code and uses that to log in and redirect to the landing
// page.
module.exports = (req, res) => {
  const { code, state, error } = req.query;

  const hostname = req.hostname;
  const clientId = hostnameToClientId(hostname);
  const rootUrl = `${req.protocol}:\/\/${hostname}`;

  const storedState = req.cookies[stateKey(clientId)];

  if (state !== storedState) {
    return res.status(401).send('Invalid state parameter.');
  }

  if (error) {
    return res.status(401).send(`Failed to authorize as a user, error: ${error}.`);
  }

  const codeVerifier = req.cookies[codeVerifierKey(clientId)];

  // clear state and code verifier cookies
  res.clearCookie(stateKey(clientId), { secure: USING_SSL });
  res.clearCookie(codeVerifierKey(clientId), { secure: USING_SSL });

  const baseUrl = BASE_URL ? { baseUrl: BASE_URL } : {};
  const tokenStore = sharetribeSdk.tokenStore.expressCookieStore({
    clientId,
    req,
    res,
    secure: USING_SSL,
  });

  const sdk = sharetribeSdk.createInstance({
    transitVerbose: TRANSIT_VERBOSE,
    clientId,
    httpAgent: httpAgent,
    httpsAgent: httpsAgent,
    tokenStore,
    typeHandlers: [
      {
        type: sharetribeSdk.types.BigDecimal,
        customType: Decimal,
        writer: v => new sharetribeSdk.types.BigDecimal(v.toString()),
        reader: v => new Decimal(v.value),
      },
    ],
    ...baseUrl,
  });

  sdk
    .login({
      code,
      redirect_uri: loginAsRedirectUri(rootUrl),
      code_verifier: codeVerifier,
    })
    .then(() => res.redirect('/'))
    .catch(() => res.status(401).send('Unable to authenticate as a user'));
};
