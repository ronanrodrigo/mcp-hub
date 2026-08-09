export function createResponse() {
  const response = {
    statusCode: undefined,
    body: undefined,
    status(code) {
      response.statusCode = code;
      return response;
    },
    json(payload) {
      response.body = payload;
      return response;
    }
  };

  return response;
}
