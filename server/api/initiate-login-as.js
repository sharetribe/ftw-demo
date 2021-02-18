const crypto = require('crypto');

const CONSOLE_URL =
  process.env.SERVER_SHARETRIBE_CONSOLE_URL || 'https://flex-console.sharetribe.com';
const USING_SSL = process.env.REACT_APP_SHARETRIBE_USING_SSL === 'true';

// redirect_uri param used when initiating a login as authentication flow and
// when requesting a token using an authorization code
const loginAsRedirectUri = rootUrl => `${rootUrl.replace(/\/$/, '')}/api/login-as`;

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

// Initiates an authorization code authentication flow. This authentication flow
// enables marketplace operators that have an ongoing Console session to log
// into their marketplace as a user of the marketplace.
//
// The authorization code is requested from Console and it is used to request a
// token from the Flex Auth API.
//
// This endpoint will return a 302 to Console which requests the authorization
// code. Console returns a 302 with the code to the `redirect_uri` that is
// passed in this response. The request to the redirect URI is handled with the
// `/login-as` endpoint.
module.exports = (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).send('Missing query parameter: user_id.');
  }

  const hostname = req.hostname;
  const clientId = hostnameToClientId(hostname);
  const rootUrl = `${req.protocol}:\/\/${hostname}`;

  if (!rootUrl) {
    return res.status(409).send('Marketplace canonical root URL is missing.');
  }

  const state = urlifyBase64(crypto.randomBytes(32).toString('base64'));
  const codeVerifier = urlifyBase64(crypto.randomBytes(32).toString('base64'));
  const hash = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64');
  const codeChallenge = urlifyBase64(hash);
  const authorizeServerUrl = `${CONSOLE_URL}/api/authorize-as`;

  const location = `${authorizeServerUrl}?\
response_type=code&\
client_id=${clientId}&\
redirect_uri=${loginAsRedirectUri(rootUrl)}&\
user_id=${userId}&\
state=${state}&\
code_challenge=${codeChallenge}&\
code_challenge_method=S256`;

  const cookieOpts = {
    maxAge: 1000 * 30, // 30 seconds
    secure: USING_SSL,
  };

  res.cookie(stateKey(clientId), state, cookieOpts);
  res.cookie(codeVerifierKey(clientId), codeVerifier, cookieOpts);
  return res.redirect(location);
};
