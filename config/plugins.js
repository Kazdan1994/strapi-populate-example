module.exports = ({env}) => ({
  transformer: {
    enabled: true,
    config: {
      prefix: '/api/',
      responseTransforms: {
        removeAttributesKey: true,
        removeDataKey: true,
      }
    }
  },
  'open-ai': {
    enabled: true,
    config: {
      API_TOKEN: env('OPENAI_TOKEN'),
    },
  },
});
